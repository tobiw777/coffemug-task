import { Before, Given, Then, When } from '@cucumber/cucumber';
import mongoose from 'mongoose';
import * as ObjectPath from 'object-path';
import supertest from 'supertest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const chai = require('chai');
const request = supertest('localhost:3000/api');

const userBody = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@doe.com',
  password: 'password',
  locality: 'EUROPE',
};

Before(function () {
  this.context = {};
});

Given('the new {word} is created', function (property) {
  this.context[property] = {};
});

When(/^I clear the database$/, async function () {
  const mongooseInstance = await mongoose.connect(`mongodb://localhost:27017`, {
    dbName: 'db_orders_test',
    connectTimeoutMS: 10000,
    replicaSet: 'RS',
  });
  const db = mongooseInstance.connection;
  try {
    const collections = await db.db!.collections();
    for (const collection of collections) {
      await db.dropCollection(collection.collectionName);
    }
  } catch (err: any) {
    if (err.code !== 26) {
      console.error(err.message);
    } // Namespace not found
  } finally {
    await db.close();
  }
});

Then(/^I set ([\w.]+) to value ([\w.]+) ?(?: as (number|boolean))?$/, function (property, value, valueMap) {
  let newValue = value;
  if (valueMap === 'number') {
    newValue = Number(value);
  } else if (valueMap === 'boolean') {
    newValue = Boolean(value);
  }
  ObjectPath.set(this.context, property, newValue);
});

Then(/^I set ([\w.]+) to "([\w.\s]+)"/, function (path: string, value: string) {
  if (value === 'true' || value === 'false' || value === 'null') {
    value = JSON.parse(value);
  }

  ObjectPath.set(this.context, path, value);
});

Then(/^I set ([\w.]+) to value from ([\w.]+)$/, function (property, valueFrom) {
  const valueFromContext = ObjectPath.get(this.context, valueFrom);
  ObjectPath.set(this.context, property, valueFromContext);
});

Then(/^I set ([\w.]+) to empty array$/, function (property) {
  ObjectPath.set(this.context, property, []);
});

Then(/^the ([\w.]+) should be empty array$/, function (property) {
  const param = ObjectPath.get(this.context, property);
  chai.expect(param?.length).to.equal(0);
});

Then(/^the ([\w.]+) should not be empty array$/, function (property) {
  const param = ObjectPath.get(this.context, property);
  chai.expect(param?.length).not.to.equal(0);
});

Then(/^the ([\w.]+) should be ([\w.]+)(?: as (number|boolean))?$/, function (contextParam, value, valueMap) {
  const param = ObjectPath.get(this.context, contextParam);
  let newValue = value;
  if (valueMap === 'number') {
    newValue = Number(value);
  } else if (value === 'boolean') {
    newValue = !!value;
  }
  chai.expect(param).to.equal(newValue);
});

Given(
  /^I try to send request ([%.\w/-?=]+) with method (get|post|patch|put|delete)?(?: using ([\w.]+) as body)? ?(?: using ([\w.]+) as headers)? and save the result as ([\w.]+)$/,
  async function (prefix, method, bodyPath, headersPath, resultPath) {
    const body = ObjectPath.get(this.context, bodyPath) ?? {};
    const headers = headersPath ? ObjectPath.get(this.context, headersPath) : {};

    const splitPrefix = prefix.split('%');
    let splitPrefixCount = 0;

    if (splitPrefix.length > 1) {
      splitPrefixCount = splitPrefix % 3;
      splitPrefix[1] = ObjectPath.get(this.context, splitPrefix[1]);
      prefix = splitPrefix.join('');
    }

    prefix = prefix && splitPrefixCount > 1 ? prefix + '/' : prefix;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const result = await request[method](prefix)
      .set('Accept', 'application/json')
      .set('Authorization', headers.Authorization || '')
      .type('json')
      .send(body);

    ObjectPath.set(this.context, resultPath, result);
  },
);

Given(
  /I register new user and save result as ([\w.]+) with ([\w.]+) as headers$/,
  async function (resultPath, headersPath) {
    const result = await request.post('/register').send(userBody);

    ObjectPath.set(this.context, resultPath, result);
    ObjectPath.set(this.context, headersPath, { Authorization: 'Bearer ' + result.body.jwt_token });
  },
);

Given(/I login and save result as ([\w.]+) with ([\w.]+) as headers$/, async function (resultPath, headersPath) {
  const result = await request.post('/login').send({
    email: userBody.email,
    password: userBody.password,
  });

  ObjectPath.set(this.context, resultPath, result);
  ObjectPath.set(this.context, headersPath, { Authorization: 'Bearer ' + result.body.jwt_token });
});

Then(/^the ([\w.[\]]+) should be "([^"]+)"$/, async function (path, value) {
  const property = ObjectPath.get(this.context, path);
  chai.expect(property).to.equal(value);
});

Then(/^it concludes test$/, () => {
  chai.assert(1);
});
