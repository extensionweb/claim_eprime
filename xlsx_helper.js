const ExcelJS = require('exceljs');

const moment = require('moment');

function ascending(a, b){
    let timeA = moment({hour: parseInt(a.hour), minute: parseInt(a.minute)});
    let timeB = moment({hour: parseInt(b.hour), minute:parseInt(b.minute)});
    return timeA.unix() - timeB.unix();
}

function time_compare(a, b){
    let timeA = moment({hour: parseInt(a.hour), minute: parseInt(a.minute)});
    let timeB = moment({hour: parseInt(b.hour), minute:parseInt(b.minute)});
    return timeA < timeB;
}

class SteamAccounts{
    constructor(){
        this.file_path;
        //this.data = [];
        this.sorted_data = [];
        this.workbook;
        this.worksheet
        //this.sheet_name;
    }
    async load(file_path){
        this.file_path = file_path;
        this.data = [];
        this.workbook = new ExcelJS.Workbook();
        await this.workbook.xlsx.readFile(file_path);

        this.worksheet = this.workbook.worksheets[0];
        let pure_data = [];
        this.worksheet.eachRow((row, rowNumber) => {
            if(rowNumber == 1) return;
            let new_account = {username: row.getCell('A').value, password: row.getCell('B').value, hour: row.getCell('C').value, minute: row.getCell('D').value, log:'', error:''};
            pure_data.push(new_account);
        });
        this.sorted_data = this.sort_by_time(pure_data);
        return {log: this.sorted_data.length+" accounts loaded", success:true, file_path: file_path};
    }
    async update(username, hour, minute){
        try{
            this.worksheet.eachRow((row, rowNumber) => {
                if(row.getCell('A').value == username){
                    row.getCell('C').value = hour;
                    row.getCell('D').value = minute;
                    return;
                }
            });
            for(let i=0;i<this.sorted_data.length;++i)
                if(this.sorted_data[i].username == username){
                    this.sorted_data[i].hour = hour;
                    this.sorted_data[i].minute = minute;
                    break;
                }
            return this.workbook.xlsx.writeFile(this.file_path);
        }
        catch(err){
            return false;
        }
    }
    sort_element(index){
        let curr_element = this.sorted_data.splice(index, 1)[0];
        let new_index;
        for(new_index=this.sorted_data.length-1;new_index>-1;--new_index)
            if(time_compare(this.sorted_data[new_index],curr_element))
                break;
        new_index++;

        console.log('sorted', this.sorted_data);
        

        this.sorted_data.splice(new_index,0,curr_element);
        let time_now = {hour:moment().hour(), minute:moment().minute()}
        if(time_compare(time_now,curr_element)){
            console.log(`run again: ${curr_element.hour}${curr_element.minute}>${time_now.hour}${time_now.minute}`)
            return true;
        }
        else return false;
    }
    get_first_index(){
        let index = 0;
        let now = moment();
        for(;index<this.sorted_data.length;++index){
          let cnt_moment = moment(this.sorted_data[index].hour+':'+this.sorted_data[index].minute, 'HH:mm');
          if (cnt_moment > now) return index;
        }
        return index;
    }
    sort_by_time(arr){
        arr.sort(ascending);
        return arr;
    }
}

module.exports = SteamAccounts;