// jshint multistr:true


define([
  'backbone',
  'underscore',
  'underscoreString',
  'text!queries/reviews.pgsql'
], function(Backbone, _, underscoreString, QUERY) {

  'use strict';

  var ReviewCollection = Backbone.Collection.extend({

    url: '//globalintegrity.cartodb.com/api/v2/sql',

    parse: function(data) {

      _.each(data.rows, function(review) {
        var result;
        switch(review.reviewopinion) {
          case 0:
            result = 'Yes, I agree with the score and have no comments to add.';
            break;
          case 1:
            result = 'Yes, I agree with the score but wish to add a comment, clarification, \
              or suggest another reference.';
            break;
          case 2:
            result = 'No, I do not agree with the score.';
            break;
          case 3:
            result = 'I am not qualified to judge this indicator.';
            break;
          default:
            result = '';
        }

        _.extend(review, {
          reviewopinion: result
        });
      });

      data.rows = _.sortBy(data.rows, 'reviewuserrole');

      return data.rows;
    },

    getReviews: function(table, question, target, callback) {
      var opinion;
      if (question || target) {
        opinion = 'and reviewopinion != -1';
      } else {
        opinion = 'reviewopinion != -1';
      }

      var opts = {
        data: {
          q: _.str.sprintf(QUERY, {
            question: question,
            target: target,
            opinion: opinion,
            table: table,
          })
        },
        success: callback,
        error: function(response, err) {
          throw err.responseText;
        }
      };

      this.fetch(opts);
    }

  });

  return ReviewCollection;

});

