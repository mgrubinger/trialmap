App = {};

Spots = new Meteor.Collection("spots");


var spotsHandle = Meteor.subscribe('spots');


// Dependencies
var showSpotsListDep = new Deps.Dependency;

/// TEMPLATES

// Template Map
Template.map.rendered = function() {
  L.Icon.Default.imagePath = '/images';

  App.markers = [];

  App.map = L.map('map', {
    doubleClickZoom: false
  }).setView([48.22284281261854, 16.3751220703125], 8);

  L.tileLayer.provider('OpenMapSurfer.Roads').addTo(App.map);

  App.map.on('click', function(event) { console.log(event.latlng); });
  App.map.on('dblclick', function(event) { 
    // if(Session.get('adding-new-spot')) {
    //   App.newSpotMarker = L.marker(event.latlng, {draggable: true}).addTo(App.map);
    // } 
  });

  var query = Spots.find();
  query.observe({
    added: function(document) {
      var options = {
        uid: document._id,
        draggable: document.preview
      };

      var marker = L.marker([document.lat, document.lng], options).addTo(App.map)
        .on('click', function(event) {
          Session.set('selected-spot', event.target.options.uid);
        });
      App.markers.push(marker);
    },
    removed: function(oldDocument) {
      layers = App.map._layers;
      var key, val;
      for (key in layers) {
        val = layers[key];
        if (val._latlng) {
          if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
            App.map.removeLayer(val);
          }
        }
      }
    }
  });
};

Template.map.events({
  'click .add-new-spot': function() {
    Session.set('adding-new-spot', true);

    // create a new document for this spot
    var new_id = Spots.insert({name: 'new spot', lat: App.map.getCenter().lat, lng: App.map.getCenter().lng, rating: 0, preview: true});

    // App.newSpotMarker = L.marker(App.map.getCenter(), {draggable: true, uid: new_id}).addTo(App.map);
    // App.newSpotMarker.on('dragend', function(event) {
    //   // update record
    //   Spots.update(Session.get('selected-spot'), {$set: {lat: App.newSpotMarker.getLatLng().lat, lng: App.newSpotMarker.getLatLng().lng}}); 
    // });
    // App.newSpotMarker.on('click', function(event) {
    //   Session.set('selected-spot', event.target.options.uid);
    // });


    // show details
    Session.set('selected-spot', new_id);
  }
});


// Template: Detail
Template.details.show_details = function () {
  showSpotsListDep.depend();
  return Session.get('selected-spot') ? true : false;
};

Template.details.spots = function () {
  if(Session.get('selected-spot')) {
    var spots = Spots.find({_id: Session.get('selected-spot')}, {limit: 1});
    return spots;
  }
  else return false;
};

Template.details.events({
  'click button.back': function() {
    delete Session.keys['selected-spot'];
    showSpotsListDep.changed();
  },
  // form save button
  'click button.save': function(event) {
    
    // get all the values
    var name = $('.spot_details input.name').val();
    var rating = $('.spot_details input.rating').val();

    Spots.update(Session.get('selected-spot'), {$set: {name: name, rating: rating, timestamp: (new Date()).getTime(), preview: false}}); 
  }
});



// Template: List
Template.list.spots = function () {
  if(Session.get('filter-rating')) return Spots.find({rating: {$gte: Session.get('filter-rating')}});
  else return Spots.find({});
};

Template.list.show_list = function () {
  showSpotsListDep.depend();
  return Session.get('selected-spot') ? false : true;
};

Template.list.events({
  'click .spots_list > li': function() {
    Session.set('selected-spot', this._id);
    // get the spot
    var spot = Spots.find({_id: Session.get('selected-spot')}, {limit: 1}).fetch();
    App.map.setView([spot[0].lat, spot[0].lng],12);
  }
});


// Template: Filter
Template.filter.rating_range = function() {
  var range = [{val: 1}, {val: 2}, {val: 3}, {val: 4}, {val: 5}];
  var minRating = Session.get('filter-rating');
  _.forEach(range, function(value, index) {
    if(minRating >= value.val) range[index].active = "selected";
    else range[index].active = "not";
  });
  return range;
};

Template.filter.events({
  'click button.rating-btn': function() {
    var minRating = this.val;
    Session.set('filter-rating', minRating);
  },
  'click button.clear-rating': function(event) {
      if(Session.get('filter-rating')) Session.set('filter-rating', 0);
  }
});



