/**
 * Created by Il Yeup, Ahn in KETI on 2017-02-25.
 */

/**
 * Copyright (c) 2018, OCEAN
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var moment = require('moment');
var shortid = require('shortid');
let request = require('sync-request');
exports.ready = function tas_ready () {

    console.log("is running")
};

function upload_flight_history(totalobj,id){
    let cnt_path = conf.ae.parent + '/' +'KETI_MUV' + '/' + "Information_Data" + '/' + id + '/' + 'Report';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + cnt_path;
    let cnt_obj = {};
    let cin_obj = {};
    cnt_obj['m2m:cnt'] = {};
    cnt_obj['m2m:cnt'].rn = 'Flight_History';
    // console.log(cnt_obj);
    let resp = request('POST',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id,
            'Content-Type': 'application/' + conf.ae.bodytype+';ty=3',
        },
        body: JSON.stringify(cnt_obj)
    });
    if(resp.statusCode == 409 || resp.statusCode == 201){
        cin_path = cnt_path+'/'+cnt_obj["m2m:cnt"].rn;
        url = 'http://' + conf.cse.host + ':' + conf.cse.port + cin_path;
        cin_obj['m2m:cin'] = {};
        cin_obj['m2m:cin'].con = totalobj;
        resp = request('POST',url,{
            headers: {
                'X-M2M-RI': shortid.generate(),
                'Accept': 'application/' + conf.ae.bodytype,
                'X-M2M-Origin': conf.ae.id,
                'Content-Type': 'application/' + conf.ae.bodytype+';ty=4',
            },
            body: JSON.stringify(cin_obj)
        });
        console.log(resp.statusCode+" "+id+"---------->\n "+JSON.stringify(cin_obj));
    }
}

function total_plan_time(flight_paln,plan_time,id){
   let get_path = conf.ae.parent + '/' + 'Life_Prediction' + '/' + 'History' +'/'+id+'?rcn=4&ty=4&cra='+plan_time;
   //  let get_path = '/Mobius/Life_Prediction/History/Zeus?rcn=4&cra=20210204T0619&ty=4';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + get_path;
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    try{
        let rsp = JSON.parse(resp.getBody())["m2m:rsp"]["m2m:cin"];
        var sumtime = 0;
        for (var i = 0; i < rsp.length; i++) {
            console.log(rsp[i].con)
            sumtime += rsp[i].con.arming_time;

            // console.log(sumtime);
        }
        var total_obj = flight_paln;
        total_obj["plan_total_armingtime"] = sumtime;
        console.log(total_obj);
        // obj = JSON.parse(rsp);
        upload_flight_history(total_obj, id);
        // console(obj);
        // }
    }
    catch (e) {
        console.log(e+"\n "+ "Not Flight Date")
    }

}
function get_flight_plan(id){

    let get_path = conf.ae.parent + '/' +'KETI_MUV' + '/' + "Information_Data" + '/' + id + '/' + 'Report'+'/'+'Flight_Plan'+'/la';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + get_path;
    try {
        let resp = request('GET', url, {
            headers: {
                'X-M2M-RI': shortid.generate(),
                'Accept': 'application/' + conf.ae.bodytype,
                'X-M2M-Origin': conf.ae.id
            }
        })
        let flight_paln = JSON.parse(resp.getBody())["m2m:cin"]["con"];
        plan_time = flight_paln["date"];
        plan_time = moment(plan_time).add(-9, "h").format('YYYYMMDDTHHmmss');
        console.log(plan_time);
        total_plan_time(flight_paln, plan_time, id);
    }
    catch (e) {
        console.log(e)
    }
}

function upload_lphistory(lphitory,id){
    let cnt_path = conf.ae.parent + '/' + 'Life_Prediction' + '/' + 'Response';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + cnt_path;
    let cnt_obj = {};
    let cin_obj = {};
    cnt_obj['m2m:cnt'] = {};
    cnt_obj['m2m:cnt'].rn = id;
    try {
        let resp = request('POST', url, {
            headers: {
                'X-M2M-RI': shortid.generate(),
                'Accept': 'application/' + conf.ae.bodytype,
                'X-M2M-Origin': conf.ae.id,
                'Content-Type': 'application/' + conf.ae.bodytype + ';ty=3',
            },
            body: JSON.stringify(cnt_obj)
        });
        if (resp.statusCode == 409 || resp.statusCode == 201) {
            flight_history_path = cnt_path + '/' + id;
            url = 'http://' + conf.cse.host + ':' + conf.cse.port + flight_history_path;
            cin_obj['m2m:cin'] = {};
            cin_obj['m2m:cin'].con = lphitory;
            resp = request('POST', url, {
                headers: {
                    'X-M2M-RI': shortid.generate(),
                    'Accept': 'application/' + conf.ae.bodytype,
                    'X-M2M-Origin': conf.ae.id,
                    'Content-Type': 'application/' + conf.ae.bodytype + ';ty=4',
                },
                body: JSON.stringify(cin_obj)
            });
            console.log(resp.statusCode + " " + id + "---------->\n " + JSON.stringify(cin_obj));
        }
    }
    catch (e) {
        console.log(e)
    }
}
function week_time_calc(resp_cin,id){
    let crttime = resp_cin["ct"];
    let flight_time = resp_cin["con"];
    console.log(crttime);
    let weektime = moment(crttime).add(-7,"d").format('YYYYMMDDTHHmmss');
    console.log(weektime);
    let get_path = conf.ae.parent + '/' + 'Life_Prediction' + '/' + 'History' +'/'+id+'?rcn=4&ty=4&cra='+weektime+'&crb=='+crttime;
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + get_path;
    try{
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    let rsp = JSON.parse(resp.getBody())["m2m:rsp"]["m2m:cin"];

    var sumtime = 0;
    for(var i = 0; i < rsp.length;i++){
        sumtime += rsp[i].con.arming_time;
    }
    lp_history(flight_time,sumtime,id);
    }
    catch (e) {
        console.log(e)
    }
}


function lp_history(lp_history,sumtime,id){
    delete lp_history["sortie_name"];
    delete lp_history["arming_time"];
    lp_history.last_week_flight_time = sumtime;
    lp_history.total_battery_time = 100;
    lp_history.total_motor_time = 100;
    lp_history.battery_life = 100;
    lp_history.motor_life = 100;
    // console.log("\n"+JSON.stringify(lp_history));
    upload_lphistory(lp_history,id);
    //최근 1주일 비행시간은 추후 고려
    //수명예지 function 기능 들어갈자리
}

function get_flight_time(id){
    let get_path = conf.ae.parent + '/' + 'Life_Prediction' + '/' + 'History' +'/'+id+'/la';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + get_path;
    try{
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    let resp_cin = JSON.parse(resp.getBody())['m2m:cin'];

    week_time_calc(resp_cin,id);
    get_flight_plan(id);
    }
    catch (e) {
        console.log(e)
    }
}

exports.noti = function(path_arr, cinObj) {
    var cin = {};
    cin.ctname = path_arr[path_arr.length-2];
    cin.con = (cinObj.con != null) ? cinObj.con : cinObj.content;
    if(cin.con == '') {
        console.log('---- is not cin message');
    }
    else {
        get_flight_time(cin.con);
        // get_Drone_info(cin.con);
    }
};