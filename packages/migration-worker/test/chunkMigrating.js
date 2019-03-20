// const amqplib = require("amqplib/callback_api");
// const fakeAmqplib = require("exp-fake-amqplib")
// amqplib.connect = fakeAmqplib.connect;

// const pushToMigrationQueue = require('./pushToMigrationQueue');

// require("chai").should();
// const { expect } = require("chai");

// describe("Migration in chunks", () => {
//   let connect;
//   beforeEach(function (done) {
//     connect = amqplib.connect;
//     done()
//   })

//   afterEach(function (done) {
//     connect = null;
//     done()
//   })

//   const host = "amqp://localhost";
//   const exchange = "INTEGRATION_MEDIATOR_TEST_1";
//   // describe(".connect()", () => {
//   //   it("exposes the expected api on connection", (done) => {
//   //     connect(host, null, (err, connection) => {
//   //       if (err) return done(err);
//   //       expect(connection).have.property("createChannel").that.is.a("function");
//   //       expect(connection).have.property("createConfirmChannel").that.is.a("function");
//   //       expect(connection).have.property("close").that.is.a("function");
//   //       expect(connection).have.property("on").that.is.a("function");
//   //       done();
//   //     });
//   //   });
//   // });

//   it("Sends a payload to the queue for processing", (done) => {
//     connect(
//       host,
//       null,
//       function (err, conn) {
//         if (err) console.log(err);
//         conn.createChannel(function (err, ch) {
//           const message = JSON.stringify({
//             migrationId: "100",
//             channelId: "xxx-aaa",
//           });
//           ch.publish(exchange, '', Buffer.from(message));
//           console.log(" [x] Sent %s", message);
//           done();
//         });
//         setTimeout(function () { conn.close(); process.exit(0) }, 500);
//       },
//     );
//   })
// });