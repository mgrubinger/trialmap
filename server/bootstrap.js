// if the database is empty on server start, create some sample data.


// Spots = new Meteor.Collection("spots");

Meteor.startup(function () {
  
  // empty
  //Spots.remove({});

  if (Spots.find().count() === 0) {
    
    var data = [
      {name: "Karlsplatz",
       lat: 48.3,
       lng: 16.3,
       rating: 4
      },
      {name: "Biketrials Vienna Indoor",
       lat: 48.4,
       lng: 16.5,
       rating: 5
      }

    ];

    // var data = [];
    // for (var i = 0; i < 20000; i++) {
    //   data[i] = {
    //     name: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
    //     lat: Math.floor(Math.random() * 180) -90,
    //     lng: Math.floor(Math.random() * 360) -180,
    //     rating: Math.floor(Math.random() * 5) +1
    //   }
    // };

    var timestamp = (new Date()).getTime();

    for (var i = 0; i < data.length; i++) {
      var info = data[i];
      info.timestamp = timestamp;
      Spots.insert(info);
      timestamp += 1; // ensure unique timestamp.
    }
    
  }
});
