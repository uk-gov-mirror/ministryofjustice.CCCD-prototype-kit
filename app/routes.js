var express = require('express')
var router = express.Router()
var data = require('./data.json')
var preloads = require('./data-preloads.json')
var utils = require('./utils')
var _ = require('underscore')

// Route index page
router.get('/', function(req, res) {
  res.render('examples/index')
})

router.get('/examples/:scheme(lgfs|agfs)/start-a-claim', function (req, res) {
  req.session.destroy()

  var path = !!~req.header('Referer').indexOf('/lgfs/') ? '/examples/lgfs/bill-type' : '/examples/agfs/final/case-details'
  res.redirect(path)

})


router.get('/examples/:scheme(lgfs|agfs)/final/cost-summary-static', function(req, res) {
  data.formcache = _.extend({}, data.formcache, preloads[req.params.scheme][req.query.load])
  res.render('examples/' + req.params.scheme + '/final/cost-summary-static', utils.loadData(req.params.scheme + '/final/cost-summary-static', data))
})

// Delete defedant model
router.get('/examples/:scheme(lgfs|agfs)/final/delete-model/:model/:id', function(req, res) {
  var id = req.params.id;
  var model = req.params.model || 'defedant';

  utils.deleteModel[model](req, res);

})


// LGFS bill type start page
router.get('/examples/lgfs/bill-type', function(req, res) {
  data.formcache = res.locals.data;
  res.render('examples/lgfs/bill-type', utils.loadData('lgfs/bill-type', data))
})

// Fee chooser that directs fixed vs graduated fees
router.get('/examples/:scheme(lgfs|agfs)/fee-chooser', function(req, res) {
  var feePath;
  data.formcache = res.locals.data;

  // the formcache lookup is very flaky. any changes to
  // macros/elements.html (select macro) might affect this
  // for the time being
  feePath = utils.feetypeLookup(data.formcache['general-select-case-type-1'], req.params.scheme);
  res.redirect(feePath);
})



// Gerenal router for AGFS/LGFS pages
router.get('/examples/:scheme(lgfs|agfs)/:folder(final|interim|transfer)/:page*?', function(req, res, next) {
  var page = req.params.page;
  var path = req.path.substring(1);
  var lookup = path.replace('examples/', '')
  data.formcache = res.locals.data;
  data.formcache.seedNum = req.query.seedNum || 1;
  if (!page) {
    res.redirect('case-details');
    next
  }
  res.render(path, utils.loadData(lookup, data))
})


// add your routes here
module.exports = router
