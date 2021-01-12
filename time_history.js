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

async function get_flight_plan(id,drone_info,time_list,flight_time){
    let plan_time = [];
    let plan_Data = [];
    let flight_history_path = conf.ae.parent + '/' +drone_info["gcs"] + '/' + "Information_Data" + '/' + id + '/' + 'Report'+'/'+'Flight_Plan'+'?fu=1&ty=4&la=3';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + flight_history_path;
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    let crt_time = JSON.parse(resp.getBody())["m2m:uril"];
    for (let i=0; i<crt_time.length;i++){
        let flight_history_cin = '/'+crt_time[i];
            url = 'http://' + conf.cse.host + ':' + conf.cse.port + flight_history_cin;
            resp = request('GET',url,{
            headers: {
                'X-M2M-RI': shortid.generate(),
                'Accept': 'application/' + conf.ae.bodytype,
                'X-M2M-Origin': conf.ae.id
            }
        })
        plan_Data[i] = JSON.parse(resp.getBody())["m2m:cin"]
        plan_time[i] = plan_Data[i]["ct"];
        plan_time[i] = moment(plan_time[i],"YYYY-MM-DD HH:mm:ss");
    }
        for (j = plan_time.length; j >= 0;j--) {
            for (i = 0; i < flight_time.length; i++) {
                if (plan_time[j] < flight_time[i]) {
                    console.log("################################");
                    console.log("plan:",j,plan_time[j]);
                    // console.log("plan1:",plan_Data[j]["con"]);
                    console.log("flight",i,"::",flight_time[i]);
                    console.log("################################");
                    cal_obj[i+"_list"].plan = plan_Data[j]["con"];
                    console.log(cal_obj);

                }
            }

        }
        flight_history(id,drone_info);
}

async function flight_history(id,drone_info){
    let flight_history_path = conf.ae.parent + '/' + drone_info["gcs"] + '/' + "Information_Data" + '/' + id + '/' + 'Report'+'/'+'Flight_History';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + flight_history_path;
    let cin_obj = {}
    let test_obj = {
        "0_list": {
            "Duration_time":"245s",
            "plan":{
                "pilot":"비행사1",
                "pilotEmail":"b_test1@email.com",
                "date":"2021-01-11",
                "area":"영월공역",
                "purpose":"시험비행"
            }
        },
        "1_list": {
            "Duration_time":"41s",
            "plan":{
                "pilot":"비행사1",
                "pilotEmail":"b_test1@email.com",
                "date":"2021-01-11",
                "area":"영월공역",
                "purpose":"시험비행"
            }
        },
        "2_list": {
            "Duration_time":"257s",
            "plan":{
                "pilot":"비행사1",
                "pilotEmail":"b_test1@email.com",
                "date":"2021-01-11",
                "area":"영월공역",
                "purpose":"시험비행"
            }
        }
    }
    cin_obj['m2m:cin'] = {};
    cin_obj['m2m:cin'].con = test_obj;

    console.log(JSON.stringify(cin_obj));
    let resp = request('POST',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id,
            'Content-Type': 'application/' + conf.ae.bodytype+';ty=4',
        },
        body: JSON.stringify(cin_obj)
    });
}

let cal_obj = {};
cal_obj['0_list']={};
cal_obj['1_list']={};
cal_obj['2_list']={};

async function cal_time(i,time_list) {
    let arming_time_path = '/'+time_list;
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + arming_time_path +'/la';
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    let end_time = JSON.parse(resp.getBody())["m2m:cin"]["ct"];


    url = 'http://' + conf.cse.host + ':' + conf.cse.port + arming_time_path;
    resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    let start_time = JSON.parse(resp.getBody())["m2m:cnt"]["ct"];
    // let start_time = arming_time_path.split('/');
    // console.log(start_time[start_time.length-2],end_time);
    start_time = moment(start_time,"YYYY-MM-DD HH:mm:ss");
    end_time = moment(end_time,"YYYY-MM-DD HH:mm:ss");
    let du_time = moment.duration(end_time.diff(start_time)).asSeconds();
    cal_obj[i+"_list"].Duration_time = du_time +'s';

    return start_time
}

async function get_Arming_time(id,drone_info){
    let start_time = [];
    let arming_list_path = conf.ae.parent + '/' +drone_info["gcs"] + '/' + "Drone_Data" + '/' + drone_info["drone"]+'?fu=1&ty=3&la=3';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + arming_list_path;
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    const time_list = JSON.parse(resp.getBody())["m2m:uril"];
    for (var i=0; i<time_list.length;i++){
        start_time[i] = await cal_time(i,time_list[i]);
    }
    if(i >= 2){
        console.log(cal_obj);
        get_flight_plan(id,drone_info,time_list,start_time);
    }

}

async function get_Drone_info(id){
    let info_parent_path = conf.ae.parent + '/' + 'MUV' + '/' + 'approval' +'/'+id+'/la';
    let url = 'http://' + conf.cse.host + ':' + conf.cse.port + info_parent_path;
    let resp = request('GET',url,{
        headers: {
            'X-M2M-RI': shortid.generate(),
            'Accept': 'application/' + conf.ae.bodytype,
            'X-M2M-Origin': conf.ae.id
        }
    })
    // console.log(JSON.stringify(JSON.parse(resp.getBody()),null,2));
    const drone_info = JSON.parse(resp.getBody())['m2m:cin']['con'];
    console.log(drone_info);
    await get_Arming_time(id,drone_info);
}

exports.noti = function(path_arr, cinObj) {
    var cin = {};
    cin.ctname = path_arr[path_arr.length-2];
    cin.con = (cinObj.con != null) ? cinObj.con : cinObj.content;
    if(cin.con == '') {
        console.log('---- is not cin message');
    }
    else {
        get_Drone_info(cin.con);
    }
};