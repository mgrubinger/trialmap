Spots = new Meteor.Collection("spots");

Meteor.publish('spots', function() {
	// return Spots.find({preview: { $not: true }});
	return Spots.find({}, {sort: {rating: -1}});
	// return Spots.find({});
	// return Spots.find({name: 'Karlsplatz'});
});