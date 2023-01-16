import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    //Example 1
    // { duration: '1m', target: 100 }, // simulate ramp-up of traffic from 1 to 100 users over 1 minutes.
    // { duration: '2m', target: 100 }, // stay at 100 users for 2 minutes
    // { duration: '1m', target: 0 }, // ramp-down to 0 users

    //Example 2 - Simulating a normal day

    { duration: '1m', target: 60 }, // simulate ramp-up of traffic from 1 to 60 users over 1 minute.
    { duration: '2m', target: 60 }, // stay at 60 users for 2 minutes
    { duration: '3m', target: 100 }, // ramp-up to 100 users over 3 minutes (peak hour starts)
    { duration: '3m', target: 100 }, // stay at 100 users for short amount of time (peak hour)
    { duration: '2m', target: 60 }, // ramp-down to 60 users over 3 minutes (peak hour ends)
    { duration: '2m', target: 60 }, // continue at 60 for additional 2 minutes
    { duration: '1m', target: 0 }, // ramp-down to 0 users


  ],
  thresholds: {
    'http_req_duration': ['p(99)<500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'https://test-api.k6.io';
const USERNAME = 'TestUser';
const PASSWORD = 'SuperCroc2020';

export default () => {
  const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  check(loginRes, {
    'logged in successfully': (resp) => resp.json('access') !== '',
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${loginRes.json('access')}`,
    },
  };

  const myObjects = http.get(`${BASE_URL}/my/crocodiles/`, authHeaders).json();
  check(myObjects, { 'retrieved crocodiles': (obj) => obj.length > 0 });

  sleep(1);
};
