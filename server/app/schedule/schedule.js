var cron = require('node-schedule');
var rule = new cron.RecurrenceRule();
rule.second = 30;
cron.scheduleJob(rule, function(){
});