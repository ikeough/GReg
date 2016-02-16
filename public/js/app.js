
var app = app || {};
var ENTER_KEY = 13;

$(function() {

    new app.PackagesView();
    new app.StatsView();
    new app.NavView()
    new app.DataView();
    new app.AdminView();
    
    app.Packages.fetch();
    app.Stats.fetch();

});
