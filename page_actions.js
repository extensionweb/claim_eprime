const moment = require('moment');
//const SteamAccounts = require('./xlsx_helper.js');

// const close_button_selector = '[d="m8.101 7 3.74-3.74a.544.544 0 0 0 0-.773l-.328-.327a.542.542 0 0 0-.387-.16.542.542 0 0 0-.387.16L7 5.898 3.261 2.16A.542.542 0 0 0 2.874 2a.542.542 0 0 0-.386.16l-.328.327a.547.547 0 0 0 0 .774L5.899 7 2.16 10.739a.544.544 0 0 0-.16.386c0 .147.057.284.16.387l.328.328c.103.103.24.16.386.16a.542.542 0 0 0 .387-.16l3.74-3.74 3.738 3.74c.103.103.24.16.387.16a.543.543 0 0 0 .386-.16l.328-.328a.544.544 0 0 0 .16-.387.544.544 0 0 0-.16-.386l-3.739-3.74Z"]';
// const green_signin_selector = '[d="M7 3.554A1.777 1.777 0 1 0 7 0a1.777 1.777 0 0 0 0 3.554ZM8.777 7a1.777 1.777 0 1 1-3.554 0 1.777 1.777 0 0 1 3.554 0Zm0 5.223a1.777 1.777 0 1 1-3.554 0 1.777 1.777 0 0 1 3.554 0Z"]'
const three_dot_chat_selector = '.icon-container.text-light-grey-3'//'#popover-reference>div>div>button>div>svg>path'
const send_tip_selector = '.ui-popover-button__icon'
const accept_send_selector = '.text-center .py-lg'
const claim_coin_selector = '[data-testid="claim-button"]'
const amount_send_selector = '[placeholder="1.00"]'
const steam_id_receiver_selector = '[placeholder="Player SteamID"]'
const time_remain_selector = '.size-medium.ml-sm'
const daily_coin_tag_selector = '[href="#daily-coins"]'


// async function get_members_info(){
//   return axios.get("https://opensheet.elk.sh/"+sheet_id+"/1")
//   .then((response) => response.data)
//   .catch((error) => console.error(error));
// }

function add_time(time1, time2){
    let [hour1, minute1] = time1;
    let [hour2, minute2] = time2;
    let new_minute = minute1+minute2;
    let new_hour = (hour1+hour2)
    if (new_minute>=60) {
      new_hour += 1;
      new_minute -= 60;
    }
    new_hour = new_hour % 24;
    console.log(`${time1}+${time2} = ${new_hour} ${new_minute}`);
    return [new_hour, new_minute];
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class PageActions{
    constructor(page){
        this.page = page;
        this.client;
        //this.navigationPromise;
    }
    async load(){
        this.client = await this.page.target().createCDPSession();
    }
    async navigationPromise(){
        return this.page.waitForNavigation({ waitUntil: ['networkidle2'] });
    }
    // async visible(selector) {
    //     return this.page.evaluate((s)=>{
    //         let elem = document.querySelector(s);
    //         //console.log('elem',s, elem, elem.getBoundingClientRect())
    //         let elemCenter   = {
    //             x: elem.getBoundingClientRect().left + elem.getBoundingClientRect().width/2,
    //             y: elem.getBoundingClientRect().top + elem.getBoundingClientRect().height/2
    //         };
    //         //console.log(elemCenter.x, elemCenter.y)
    //         let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    //         //if(!pointContainer) return false;
    //         while (pointContainer){
    //             if (pointContainer === elem) return elemCenter;
    //             pointContainer = pointContainer.parentNode;
    //         }
    //         return false;
    //     }, selector);
    // }
    async close_front_popup(){
        await this.page.mouse.click(1,1);
        await sleep(500);
        await this.page.mouse.click(1,1);
        await sleep(500);
        await this.page.mouse.click(1,1);
    }
    // async click_on_front(selector, timeout=30000){
    //     await this.page.waitForSelector(selector,{timeout:timeout});
    //     let max_close = 10;
    //     while(!await this.visible(selector) && max_close--){
    //         await this.close_front_popup();
    //         await sleep(1000);
    //     }
    //     await sleep(2000);
    //     await this.page.click(selector);
    // }
    // async type_on_front(selector, text,timeout=30000){
    //     await this.page.waitForSelector(selector,{timeout:timeout});
    //     let max_close = 10;
    //     while(!await this.visible(selector) && max_close--){
    //         await this.close_front_popup();
    //         await sleep(1000);
    //     }
    //     await sleep(2000);
    //     await this.page.type(selector, text);
    // }
    async click_on_front(selector){
        await this.close_front_popup();
        return this.click(selector);
    }
    async click(selector){
        await this.page.waitForSelector(selector);
        await sleep(1000);
        return this.page.click(selector);
    }
    async type(selector, text){
        await this.page.waitForSelector(selector);
        await sleep(1000);
        return this.page.type(selector, text);
    }
    async get_remain_time(){
        return this.page.evaluate((time_remain_selector)=>{
            try{
                console.log('time_remain_selector', time_remain_selector);
                let time_remain_element = document.querySelector(time_remain_selector);
                console.log('time_remain_element',time_remain_element)
                let time_remain = time_remain_element.textContent;
                console.log('time_remain',time_remain);

                let hour = /(\d+?)\shour/gm.exec(time_remain) ? parseInt(/(\d+?)\shour/gm.exec(time_remain)[1]):0;
                let minute = /(\d+?)\sminute/gm.exec(time_remain) ? parseInt(/(\d+?)\sminute/gm.exec(time_remain)[1]):0;
                let second = /(\d+?)\ssecond/gm.exec(time_remain) ? parseInt(/(\d+?)\ssecond/gm.exec(time_remain)[1]):0;

                if(hour>0 || minute>0)
                    return [hour, minute];
                else if(second>0)
                    return 'some seconds'
                else return 'Lỗi khi lấy time remain: ' + time_remain;
            }catch(err){
                console.log(err);
                return 'Lỗi khi lấy time remain' + err.toString();
            }
        }, time_remain_selector)
    }
    async login(username, password){
        try{
            await this.client.send('Network.clearBrowserCookies');
            await this.client.send('Network.clearBrowserCache');
            await this.page.goto('https://csgoempire.com/referrals');
            //await this.navigationPromise();
            await this.click('.btn-green');

            //await this.navigationPromise();
            await sleep(2000);
            await this.type('input[type="text"]',username)
            await this.type('input[type="password"]',password)
            await this.click('[type="submit"]');
            //await this.navigationPromise()
            try{
                await this.click('#imageLogin',20000);
            }
            catch(err){
                return {type:'error', message:username+' sai mật khẩu'};  
            }
            await this.navigationPromise();
            await this.click_on_front(daily_coin_tag_selector);
            await sleep(2000);
            return true;
        }
        catch(err){
            let err_string =  err.toString();
            if(err_string.includes('.btn-green'))
                return {type:'error', message: username+' lỗi khi đăng nhập: Không click được vào nút Sign in ở trang chủ'};  
            else if(err_string.includes('input[type="text"]'))
                return {type:'error', message: username+' lỗi khi đăng nhập: Không tìm thấy ô nhập username'};  
            else if(err_string.includes('input[type="password"]'))
                return {type:'error', message: username+' lỗi khi đăng nhập: Không tìm thấy ô nhập password'};  
            else if(err_string.includes('[type="submit"]'))
                return {type:'error', message: username+' lỗi khi đăng nhập: Không tìm thấy ô submit lần 1'}; 
            return  {type:'error', message: username+' lỗi khi đăng nhập: '+ err.toString()}; 
        }
    }
    async claim_coin(username){
        if (await this.page.$(claim_coin_selector)){
            await this.click(claim_coin_selector);
            return {type:'log', message: username+' đã claim coin'}
        }
        else {
            let time_now = [moment().hour(), moment().minute()]
            await sleep(1000);
            let remain_time = await this.get_remain_time();
            if(remain_time.includes('Lỗi khi lấy time remain')){
                return {type:'error', message:remain_time};
            }
            else if(remain_time == 'some seconds'){
                await this.page.waitForSelector(claim_coin_selector, {timeout:60000});
                return this.claim_coin(username);
            }
            let new_time = add_time(remain_time, time_now);
            //let s = update_data(username, new_time);
            return {type:'error', message: username+' chưa đến giờ nhận, chờ đến '+new_time[0]+':'+new_time[1], hour:new_time[0], minute:new_time[1]};
            //return 'update claim '+s;
        }
    }
    
    async send_tip(username, receiver_id){
        try{
            console.log('send_tip(',username, receiver_id,')');
            await this.click_on_front(three_dot_chat_selector);
            console.log('pass three_dot_chat_selector')
            await this.click(send_tip_selector);
            console.log('pass send_tip_selector')

            await this.type(steam_id_receiver_selector, receiver_id);
            console.log('pass steam_id_receiver_selector')

            let amount_div = await this.page.$(".balance");
            let coin_amount = await amount_div.evaluate(el => el.textContent);
            let regex = /[+-]?\d+(\.\d+)?/g;
            coin_amount = coin_amount.match(regex)[0];
            await this.type(amount_send_selector, coin_amount);
            console.log('pass amount_send_selector')

            await this.click('[type="submit"]');
            await sleep(1000);
            await this.click(accept_send_selector);
            console.log('pass accept_send_selector');
            await sleep(5000);
            return {type:'log', message: username+' đã gửi '+ coin_amount +' coin'};
        }catch(err){
            return {type:'error', message: username+' lỗi gửi coin: '+err.toString()};
        }
    }
}
module.exports = PageActions;