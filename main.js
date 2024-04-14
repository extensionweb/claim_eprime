// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const puppeteer = require('puppeteer');
const {dialog, shell} = require('electron');
const moment = require('moment');
const MembersManager = require('./sheet.js');
const SteamAccounts = require('./xlsx_helper.js');
const PageActions = require('./page_actions.js');

const sheet_id = '18BzYJcrY3uw6ZnXQO7z14kNh1XPRkjhIt7jFInocasM'

let members_sheet = new MembersManager(sheet_id);
let page_actions;
let steam_accounts = new SteamAccounts();
var browser;
var mainWindow;
var wait_next_run;



function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  mainWindow.loadFile('index.html')
}

app.on('ready',()=>{
  createWindow()
  mainWindow.webContents.on('did-finish-load', function () {
    run();
  });
})

async function run(){
  await members_sheet.loadInfo();
  ipcMain.on('open_excel', async (event)=>{
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Excel', extensions: ['xlsx']}
      ]
    }).then(async function (files) {
        if (!files.canceled) {
          let file_path = files.filePaths[0]
          mainWindow.webContents.send('update_excel_path', file_path);
          await load_excel(file_path);
        }
      }
    )
    .catch(err=>{
      console.log(err);
    })
  })

  ipcMain.on('load_excel', async (event, excel_path)=>{
    await load_excel(excel_path);
  })

  ipcMain.on('start', async (event, excel_path, receiver_id, mode)=>{
    await load_excel(excel_path)
    let headless = mode == '0' ? 'new':false;
    start(receiver_id, headless);
  })
  ipcMain.on('stop', async (event)=>{
    clearTimeout(wait_next_run);
    browser.close();
  })
  ipcMain.on('execute_file', async (event, file_path)=>{
    shell.openPath(file_path);
  })
  ipcMain.on('get_members', async (event)=>{
    let members_info = await members_sheet.get_members();
    //console.log(members_info);
    mainWindow.webContents.send('show_members', JSON.stringify(members_info));
  })
  ipcMain.on('add_member', async (event, username, password, from_date, to_date)=>{
    await members_sheet.add_member(username, password, from_date, to_date);
    let members_info = await members_sheet.get_members();
    //console.log(members_info);
    mainWindow.webContents.send('show_members', JSON.stringify(members_info));
  })
  ipcMain.on('remove_member', async (event, username)=>{
    await members_sheet.remove_member(username);
    let members_info = await members_sheet.get_members();
    //console.log(members_info);
    mainWindow.webContents.send('show_members', JSON.stringify(members_info));
  })
  ipcMain.on('edit_member', async (event, username, from_date, to_date)=>{
    await members_sheet.update_member(username, from_date, to_date);
    let members_info = await members_sheet.get_members();
    //console.log(members_info);
    mainWindow.webContents.send('member_updated', username);
  })
}

function getScreenDimensions() {
  let primaryDisplay = screen.getPrimaryDisplay();
  let { width, height } = primaryDisplay.workAreaSize;
  return { width:1280, height: 720 };
}

async function load_excel(excel_path){
  let read_steam_accounts = await steam_accounts.load(excel_path);
  if(read_steam_accounts.success){
    mainWindow.webContents.send('log', read_steam_accounts.log, read_steam_accounts.file_path);
    mainWindow.webContents.send('show_accounts', JSON.stringify(steam_accounts.sorted_data));
  }
}

async function collect_for_account(username, password, receiver_id){
  let login_status = await page_actions.login(username, password);
  if (login_status.type == 'error') return login_status;

  let claim_status = await page_actions.claim_coin(username);
  if(claim_status.message.includes('đã claim coin')) {
    await steam_accounts.update(username, moment().hour(), moment().minute());
    return page_actions.send_tip(username, receiver_id);
  }
  else if(claim_status.message.includes('chờ đến')){
    await steam_accounts.update(username, claim_status.hour, claim_status.minute);
    return claim_status;
  }
  else return claim_status;
}
function run_account_recursive(index, receiver_id){
  let data = steam_accounts.sorted_data;
  //console.log(index, data);
  let now = moment();
  let next_run_time;

  if(index >= data.length){
    index = 0;
    let day = now.format('DD/MM/YYYY');
    next_run_time = moment(`${day} ${data[index].hour}:${data[index].minute}`, "DD/MM/YYYY HH:mm");
    if (next_run_time < now) next_run_time.add(1, 'days');
  }
  else{
    let day = now.format('DD/MM/YYYY');
    next_run_time = moment(`${day} ${data[index].hour}:${data[index].minute}`, "DD/MM/YYYY HH:mm");
  }

  wait_next_run = setTimeout(async function(){
    let collect_status = await collect_for_account(data[index].username, data[index].password,receiver_id);
    steam_accounts.sorted_data[index][collect_status.type] += '\n'+collect_status.message;

    if(collect_status.message.includes("đã gửi"))
      steam_accounts.sorted_data[index]['background_color'] = 'limegreen';
    else if(collect_status.message.includes("chờ đến"))
      steam_accounts.sorted_data[index]['background_color'] = 'yellow';
    else steam_accounts.sorted_data[index]['background_color'] = 'LightCoral';

    if(collect_status.message.includes('chờ đến')){
      let sort_status = steam_accounts.sort_element(index);
      if(sort_status) return run_account_recursive(index, receiver_id);
      else return run_account_recursive(index+1, receiver_id); 
    }
    else {
      return run_account_recursive(index+1, receiver_id);
    }
  }, next_run_time.toDate().getTime() - now.toDate().getTime());
  steam_accounts.sorted_data[index]['log'] += '\n'+data[index].username+' sẽ chạy vào ' + next_run_time.format("DD/MM HH:mm");
  steam_accounts.sorted_data[index]['background_color'] = 'aqua';
  mainWindow.webContents.send('show_accounts', JSON.stringify(steam_accounts.sorted_data));
}

async function start(receiver_id, headless){
  let viewport = headless ? getScreenDimensions():null;
  browser = await puppeteer.launch({ headless: headless, defaultViewport: getScreenDimensions() , args: ['--lang=vn-VI,vn']});
  let pages = await browser.pages();
  page_actions  = new PageActions(pages[0]);
  await page_actions.load();
  let first_index = steam_accounts.get_first_index();
  run_account_recursive(first_index, receiver_id);
}

