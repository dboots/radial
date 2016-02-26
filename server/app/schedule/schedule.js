var cron = require('node-schedule');
var rule = new cron.RecurrenceRule();

//-- Schedule job ever x seconds
rule.second = 30;

cron.scheduleJob(rule, function(){

});