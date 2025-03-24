require('./helpers');
const chai = require('chai');
const spies = require('chai-spies');
const nock = require('nock');
chai.use(spies);

const rando = Math.ceil(Math.random() * 1000);

describe("submitData()", () => {
  beforeEach(function () {
    window.fetch = require('node-fetch');
    chai.spy.on(window, 'fetch');
    window.onerror = undefined;
  });

  it("makes a POST request to /users with a name and email", async () => {
    let reqBody;
    let headers;
    nock('http://localhost:3000')
      .post('/users')
      .reply(201, function (uri, requestBody) {
        reqBody = requestBody;
        headers = this.req.headers;
        return { id: rando, ...requestBody };
      });

    let name = "Steve";
    let email = "steve@steve.com";

    await submitData(name, email);
    expect(window.fetch).to.have.been.called.with('http://localhost:3000/users');
    expect(window.fetch).to.have.been.called.exactly(1);
    expect(headers['content-type'][0]).to.equal('application/json');
    expect(headers['accept'][0]).to.equal('application/json');
    expect(Object.keys(reqBody)).to.deep.equal(["name", "email"]);
    expect(reqBody.name).to.eq("Steve");
    expect(reqBody.email).to.eq("steve@steve.com");
  });

  it("handles the POST request response, retrieves the new id value and appends it to the DOM", async function () {
    nock('http://localhost:3000')
      .post('/users')
      .reply(201, function (uri, requestBody) {
        return { id: rando, ...requestBody };
      });

    let name = "Sam";
    let email = "sam@sam.com";

    await submitData(name, email);
    expect(document.body.innerHTML).to.include(rando);
  });

  it("handles a failed POST request using catch, appends the error message to the DOM", async function () {
    let message = 'Unauthorized Access';
    nock('http://localhost:3000')
      .post('/users')
      .replyWithError({ message: message, code: '401' });

    let name = "Jim";
    let email = "jim@jim.com";

    await submitData(name, email);
    expect(document.body.innerHTML).to.include(message);
  });
});