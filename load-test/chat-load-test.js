import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// ---------------------------------------------------------------------------
// Custom metrics (client-side, complement server-side Prometheus)
// ---------------------------------------------------------------------------
const chatMessagesSent = new Counter('chat_messages_sent');
const authCycles       = new Counter('auth_cycles');
const authErrors       = new Counter('auth_errors');
const messageSendTime  = new Trend('message_send_duration_ms');

// ---------------------------------------------------------------------------
// k6 options — runs effectively forever with 15 concurrent bot VUs
// ---------------------------------------------------------------------------
export const options = {
  scenarios: {
    chat_bots: {
      executor: 'constant-vus',
      vus: 15,
      duration: '876000h', // ~100 years
    },
  },
  thresholds: {
    http_req_failed:   ['rate<0.05'],  // <5% HTTP errors
    http_req_duration: ['p(95)<2000'], // 95th percentile under 2s
  },
};

// ---------------------------------------------------------------------------
// Bot pool — allocated once, shared across all VUs without copying
// ---------------------------------------------------------------------------
const BOT_COUNT  = 15;
const BOT_PASS   = 'Loadtest@123';

const botUsers = new SharedArray('bots', function () {
  const users = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    let personality;
    if (i < 5)       personality = 'chatty';
    else if (i < 10) personality = 'normal';
    else             personality = 'lurker';

    users.push({
      index:       i,
      username:    'chatbot_' + i,
      email:       'chatbot_' + i + '@loadtest.local',
      password:    BOT_PASS,
      personality: personality,
    });
  }
  return users;
});

// ---------------------------------------------------------------------------
// Realistic chat phrases
// ---------------------------------------------------------------------------
const PHRASES = [
  // greetings
  'hey!', 'hi there', "what's up?", 'yo', 'hey, how are you?',
  'good morning!', 'evening!', 'heyy', 'sup', 'heya',
  // casual
  'haha yeah', 'lol true', 'same tbh', 'omg no way', "that's wild",
  'wait really?', 'makes sense I guess', 'honestly agree',
  'not sure about that', 'interesting', 'tell me more',
  'I know right?', 'haha ikr', 'bro same', 'oof', 'facts',
  "ngl that's funny", 'hahaha', 'no way', 'wow ok', 'fair enough',
  // questions
  'what do you think?', 'you around?', 'you seen the news?',
  "what are you up to?", "how's your day going?", 'did you finish that thing?',
  'what time works for you?', 'did you sleep well?', 'you good?',
  'have you tried that yet?', 'got a minute?', 'you free later?',
  // short replies
  'yeah', 'no', 'maybe', 'ok', 'sure', 'nope',
  'absolutely', 'idk', 'lol', 'fr?', 'yep', 'nah',
  'definitely', 'kinda', 'not really', 'probably',
  // farewells / away
  'gotta go, ttyl', 'brb', 'back in a bit', 'afk for a sec',
  'see ya', 'later!', 'gtg', 'bbl',
];

function randomPhrase() {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

// ---------------------------------------------------------------------------
// Sleep durations by personality and conversation context
// ---------------------------------------------------------------------------
function rand(min, max) {
  return min + Math.random() * (max - min);
}

function sleepFor(personality, context) {
  const profiles = {
    chatty: {
      reading: function() { return rand(0.5, 1.5); },
      typing:  function() { return rand(0.3, 0.8); },
      turn:    function() { return rand(1,   3);   },
      away:    function() { return rand(2,   5);   },
      idle:    function() { return rand(1,   2);   },
    },
    normal: {
      reading: function() { return rand(1,   3);   },
      typing:  function() { return rand(0.5, 1.5); },
      turn:    function() { return rand(3,   8);   },
      away:    function() { return rand(5,  15);   },
      idle:    function() { return rand(2,   5);   },
    },
    lurker: {
      reading: function() { return rand(3,   8);   },
      typing:  function() { return rand(1,   3);   },
      turn:    function() { return rand(10, 30);   },
      away:    function() { return rand(15, 45);   },
      idle:    function() { return rand(5,  15);   },
    },
  };
  const profile = profiles[personality] || profiles.normal;
  const fn = profile[context];
  return fn ? fn() : rand(2, 5);
}

function messageCount(personality) {
  if (personality === 'chatty') return Math.floor(rand(2, 5)); // 2-4
  if (personality === 'lurker') return 1;
  return Math.floor(rand(1, 3)); // 1-2
}

// ---------------------------------------------------------------------------
// setup() — runs once before any VU starts, registers/logs in all bots
// ---------------------------------------------------------------------------
export function setup() {
  const BASE = __ENV.BASE_URL || 'http://localhost:7777';
  const headers = { 'Content-Type': 'application/json' };
  const registeredUsers = [];

  console.log('=== Setup: registering ' + BOT_COUNT + ' bot users ===');

  for (let i = 0; i < BOT_COUNT; i++) {
    const bot = botUsers[i];
    // Each bot gets its own isolated cookie jar during setup
    const jar = http.cookieJar();
    const opts = { headers: headers, jar: jar };

    let userId = null;

    // Try registration first
    const regRes = http.post(
      BASE + '/api/auth/register',
      JSON.stringify({ username: bot.username, email: bot.email, password: bot.password }),
      opts
    );

    if (regRes.status === 201) {
      const body = JSON.parse(regRes.body);
      userId = body.user.id;
      console.log('Registered: ' + bot.username + ' (' + userId + ')');
    } else if (regRes.status === 400) {
      // Already exists — fall back to login
      const loginRes = http.post(
        BASE + '/api/auth/login',
        JSON.stringify({ email: bot.email, password: bot.password }),
        opts
      );

      if (loginRes.status !== 200) {
        console.error('Login failed for ' + bot.username + ': ' + loginRes.body);
        continue;
      }

      // Fetch _id via auth/check (login response doesn't include it)
      const checkRes = http.get(BASE + '/api/auth/check', { jar: jar });
      if (checkRes.status === 200) {
        const parsed = JSON.parse(checkRes.body);
        userId = parsed.user._id;
        console.log('Existing user: ' + bot.username + ' (' + userId + ')');
      } else {
        console.error('auth/check failed for ' + bot.username + ': ' + checkRes.body);
        continue;
      }
    } else {
      console.error('Unexpected status ' + regRes.status + ' for ' + bot.username + ': ' + regRes.body);
      continue;
    }

    registeredUsers.push({
      index:       bot.index,
      username:    bot.username,
      email:       bot.email,
      password:    bot.password,
      id:          userId,
      personality: bot.personality,
    });

    sleep(0.2); // small courtesy between registrations
  }

  console.log('=== Setup complete: ' + registeredUsers.length + '/' + BOT_COUNT + ' bots ready ===');
  return registeredUsers;
}

// ---------------------------------------------------------------------------
// default() — each VU runs this in a loop indefinitely
// ---------------------------------------------------------------------------
export default function (data) {
  const BASE = __ENV.BASE_URL || 'http://localhost:7777';
  const headers = { 'Content-Type': 'application/json' };

  if (!data || data.length === 0) {
    console.error('VU ' + __VU + ': no bot data from setup, sleeping');
    sleep(10);
    return;
  }

  // Assign this VU to one bot deterministically
  const myIndex = (__VU - 1) % data.length;
  const me = data[myIndex];

  if (!me || !me.id) {
    console.error('VU ' + __VU + ': invalid bot at index ' + myIndex);
    sleep(10);
    return;
  }

  // ── 1. Auth check — login if session expired or first iteration ──────────
  group('auth_check', function () {
    const checkRes = http.get(BASE + '/api/auth/check');

    if (checkRes.status === 401) {
      // Not logged in — perform login (k6 VU cookie jar persists across iterations)
      const loginRes = http.post(
        BASE + '/api/auth/login',
        JSON.stringify({ email: me.email, password: me.password }),
        { headers: headers }
      );

      const ok = check(loginRes, { 'login ok': function(r) { return r.status === 200; } });
      if (!ok) {
        authErrors.add(1);
        sleep(5);
        return;
      }
      authCycles.add(1);
    } else {
      check(checkRes, { 'already authed': function(r) { return r.status === 200; } });
    }
  });

  // ── 2. Fetch user list to find conversation partners ─────────────────────
  let partners = [];
  group('fetch_user_list', function () {
    const usersRes = http.get(BASE + '/api/message/users');
    check(usersRes, { 'got user list': function(r) { return r.status === 200; } });

    if (usersRes.status === 200) {
      const allUsers = JSON.parse(usersRes.body);
      // Only chat with known bots — never accidentally DM real users
      const botIdSet = {};
      for (let i = 0; i < data.length; i++) {
        botIdSet[data[i].id] = true;
      }
      partners = allUsers.filter(function(u) { return botIdSet[u._id]; });
    }
  });

  if (partners.length === 0) {
    sleep(sleepFor(me.personality, 'idle'));
    return;
  }

  // Pick a random partner
  const partner = partners[Math.floor(Math.random() * partners.length)];
  const partnerId = partner._id;

  // ── 3. Read conversation history (simulates opening a chat) ──────────────
  group('read_history', function () {
    const histRes = http.get(BASE + '/api/message/' + partnerId);
    check(histRes, { 'got history': function(r) { return r.status === 200; } });
  });

  // "Reading" pause — user scrolls through the chat
  sleep(sleepFor(me.personality, 'reading'));

  // ── 4. Send messages (1-4 depending on personality) ──────────────────────
  const count = messageCount(me.personality);

  group('send_messages', function () {
    for (let m = 0; m < count; m++) {
      const text = randomPhrase();
      const start = Date.now();

      const sendRes = http.post(
        BASE + '/api/message/send/' + partnerId,
        JSON.stringify({ text: text }),
        { headers: headers }
      );

      messageSendTime.add(Date.now() - start);
      const ok = check(sendRes, { 'message sent': function(r) { return r.status === 200; } });
      if (ok) {
        chatMessagesSent.add(1);
      }

      // Inter-message typing pause (not after the last message)
      if (m < count - 1) {
        sleep(sleepFor(me.personality, 'typing'));
      }
    }
  });

  // ── 5. Occasional logout/login cycle (~5% of turns) ──────────────────────
  if (Math.random() < 0.05) {
    group('session_refresh', function () {
      const logoutRes = http.post(BASE + '/api/auth/logout');
      check(logoutRes, { 'logged out': function(r) { return r.status === 200; } });

      sleep(sleepFor(me.personality, 'away'));

      const loginRes = http.post(
        BASE + '/api/auth/login',
        JSON.stringify({ email: me.email, password: me.password }),
        { headers: headers }
      );
      check(loginRes, { 'logged back in': function(r) { return r.status === 200; } });
      authCycles.add(1);
    });
  }

  // ── End-of-turn rest ─────────────────────────────────────────────────────
  sleep(sleepFor(me.personality, 'turn'));
}
