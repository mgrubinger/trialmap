App = {};


var spotsHandle = Meteor.subscribe('spots');
var spotsPreviewHandle = Meteor.subscribe('spots-preview');


// Dependencies
var showSpotsListDep = new Deps.Dependency;
var deleteSpotsListDep = new Deps.Dependency;

/// TEMPLATES

// Template Map
Template.map.rendered = function() {
  L.Icon.Default.imagePath = '/images';

  App.markers = [];

  App.map = L.map('map', {
    doubleClickZoom: true
  }).setView([48.22284281261854, 16.3751220703125], 8);

  L.tileLayer.provider('OpenMapSurfer.Roads').addTo(App.map);

    App.map.on('click', function(event) { 
        console.log(event.latlng); 
    
        if(App.editMarker) {
            App.editMarker.setLatLng(event.latlng);
        }

    });
 

  App.map.on('dblclick', function(event) { 
    // if(Session.get('adding-new-spot')) {
    //   App.editMarker = L.marker(event.latlng, {draggable: true}).addTo(App.map);
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

      if(document.preview) App.editMarker = marker;

    },
    changed: function(newDocument, oldDocument) {
      App.markers.forEach(function(l) {
        if(l.options.uid == Session.get('selected-spot')) {
          App.editMarker = l;
        }
      });
      if(!oldDocument.preview && newDocument.preview) {
        // changed to preview = false
        App.editMarker.dragging.enable();
      }
      else if(oldDocument.preview && !newDocument.preview) {
        // change to preview = false
        App.editMarker.dragging.disable();
      }

      if(!newDocument.preview) {
        App.editMarker = undefined;
      }
    },
    removed: function(oldDocument) {

      App.markers.forEach(function(l) {
        if(l.options.uid == oldDocument._id) {
            App.map.removeLayer(l);
        }
      });
    }
  });
};

Template.map.events({
    'click .add-new-spot': function() {
        Session.set('adding-new-spot', true);

        // create a new document for this spot
        var new_id = Spots.insert({name: 'new spot', lat: App.map.getCenter().lat, lng: App.map.getCenter().lng, rating: 0, preview: true});

        // update record
        App.editMarker.on('dragend', function(event) {
          Spots.update(Session.get('selected-spot'), {$set: {lat: App.editMarker.getLatLng().lat, lng: App.editMarker.getLatLng().lng}}); 
        });
        App.editMarker.on('click', function(event) {
          Session.set('selected-spot', event.target.options.uid);
        });

        // show details
        Session.set('selected-spot', new_id);
    }
});


// Template: Detail
Template.details.helpers({
    showDetails: function () {
        showSpotsListDep.depend();
        return Session.get('selected-spot') ? true : false;
    },

    deleting: function() {
        deleteSpotsListDep.depend();
        return Session.get('deleting-spot') ? true : false;
    },

    deletingCountdown: function() {
        return Session.get('deleting-countdown') || "";
    },

    spots: function () {
        if(Session.get('selected-spot')) {
            var spots = Spots.find({_id: Session.get('selected-spot')}, {limit: 1});
            return spots;
        }
            else return false;
    }
});


Template.details.events({
    'click button.back': function() {
        delete Session.keys['selected-spot'];
        delete Session.keys['deleting-spot'];
        showSpotsListDep.changed();
    },
    
    'click button.delete_1': function() {
        Session.set('deleting-spot', true);
        App.deletingCountdownInterval = setInterval(function() {
            var countdown = Session.get('deleting-countdown') || 100;
            Session.set('deleting-countdown', countdown-1);
            if(countdown == 1) {
                clearInterval(App.deletingCountdownInterval);
                delete Session.keys['deleting-countdown'];
                delete Session.keys['deleting-spot'];
                deleteSpotsListDep.changed();
            }
        }, 50);
    },

    'click button.delete_confirm': function() {
        var spotId = Session.get('selected-spot');
        delete Session.keys['selected-spot'];
        delete Session.keys['deleting-spot'];
        showSpotsListDep.changed();

        Spots.remove({_id: spotId});
    },

    // form save button
    'click button.save': function(event) {
        // get all the values
        var name = $('.spot_details input.name').val();
        var rating = $('.spot_details input.rating').val();

        Spots.update(Session.get('selected-spot'), {$set: {name: name, rating: rating, timestamp: (new Date()).getTime(), preview: false}});
        
        delete Session.keys['deleting-spot'];
        delete Session.keys['deleting-countdown'];
    },
    
    // form save button
    'click button.edit': function(event) {
        Spots.update(this._id, {$set: {preview: true}});
    }
});



// Template: List
Template.list.helpers({
    showList: function () {
        showSpotsListDep.depend();
        return Session.get('selected-spot') ? false : true;
    },
    spots: function () {
        if(Session.get('filter-rating')) return Spots.find({rating: {$gte: Session.get('filter-rating')}});
        else return Spots.find({});
    }
});

Template.list.events({
    'click .spots_list > li': function() {
        Session.set('selected-spot', this._id);
        // get the spot
        var spot = Spots.find({_id: Session.get('selected-spot')}, {limit: 1}).fetch();
        App.map.setView([spot[0].lat, spot[0].lng],12);
    }
});




// Template: Filter
Template.filter.helpers({
  ratingRange: function() {
    var range = [{val: 1}, {val: 2}, {val: 3}, {val: 4}, {val: 5}];
    var minRating = Session.get('filter-rating');
    _.forEach(range, function(value, index) {
      if(minRating >= value.val) range[index].active = "selected";
      else range[index].active = "not";
    });
    return range;
  }
}); 

Template.filter.events({
    // click on rating button
    'click span.rating-btn': function() {
        var minRating = this.val;
        Session.set('filter-rating', minRating);
    },

    // clear rating
    'click button.clear-rating': function(event) {
        if(Session.get('filter-rating')) Session.set('filter-rating', 0);
    }
});



