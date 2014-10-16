

/// SPOTS COLLECTION
Spots = new Mongo.Collection("spots");

// Spots.allow({
//   // insert: function (userId, party) {
//   //   return false; // no cowboy inserts -- use createParty method
//   // },
//   // update: function (userId, party, fields, modifier) {
//   //   if (userId !== party.owner)
//   //     return false; // not the owner

//   //   var allowed = ["title", "description", "x", "y"];
//   //   if (_.difference(fields, allowed).length)
//   //     return false; // tried to write to forbidden field

//   //   // A good improvement would be to validate the type of the new
//   //   // value of the field (and if a string, the length.) In the
//   //   // future Meteor will have a schema system to makes that easier.
//   //   return true;
//   // },
//   remove: function (userId, party) {
//     // You can only remove parties that you created and nobody is going to.
//     return party.owner === userId && attending(party) === 0;
//   },
//   clear: function() {

//   }
// });


Meteor.methods({
  // options should include: title, description, x, y, public
  clearSpots: function (options) {
    // check(options, {
    //   title: NonEmptyString,
    //   description: NonEmptyString,
    //   x: Coordinate,
    //   y: Coordinate,
    //   public: Match.Optional(Boolean),
    //   _id: Match.Optional(NonEmptyString)
    // });

    Spots.remove({});
    return id;
  }
});