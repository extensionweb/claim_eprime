const { ipcMain } = require('electron');
const electron = require('electron');
const { ipcRenderer } = electron;

let input_excel = document.getElementById('input_excel');
let input_excel_label = document.getElementById('input_excel_label');
let playpause = document.getElementById('playpause');

let receiver_id = document.getElementById('receiver_id');
let table_members_header = document.getElementById('table_members_header');
let table_members = document.getElementById('table_members');
let table_members_div = document.getElementById('table_members_div');
let plus_member = document.getElementById('plus_member');
let add_member = document.getElementById('add_member')
let add_member_command = document.getElementById('add_member_command');
let run_hide = document.getElementById('run_hide');
let run_show = document.getElementById('run_show');
let steam_accounts = document.getElementById('steam_accounts');
let number_steam_accounts = document.getElementById('number_steam_accounts');
let focus_current_account = document.getElementById('focus_current_account')

receiver_id.value = localStorage.receiver_id ? localStorage.receiver_id:'';
setTimeout(function(){
    if(localStorage.hasOwnProperty('excel_path')){
        let filename = localStorage.excel_path.replace(/^.*[\\/]/, '');
        input_excel_label.textContent = filename;
        input_excel_label.title = localStorage.excel_path;
        ipcRenderer.send('load_excel', localStorage.excel_path);
    }
},1000);


if(localStorage.run_mode == '0') 
    run_hide.checked = true;    
else run_show.checked = true;

input_excel.onclick = function(){
    ipcRenderer.send('open_excel');
}
plus_member.onclick = function(){
    if(add_member_command.style.display != 'block')
        add_member_command.style.display = 'block';
    else
        add_member_command.style.display = 'none';
}
focus_current_account.onclick = function(){
    for(let account of steam_accounts)
        if(document.getElementById(account.username).style.backgroundColor == 'aqua'){
            document.getElementById(account.username).focus();
            return;
        }
}
add_member.onclick = function(){
    let username = document.getElementById('new_username').value;
    let password = document.getElementById('new_password').value;
    let from_date = document.getElementById('new_from_date').value;
    let to_date = document.getElementById('new_to_date').value;
    from_date = new Date(from_date).getTime();
    to_date = new Date(to_date).getTime();
    ipcRenderer.send('add_member', username, password, from_date, to_date);
}

table_members_header.onclick = function(){
    if (table_members_div.style.display != 'block'){
        table_members_div.style.display = 'block';
        ipcRenderer.send('get_members');
    }
    else 
        table_members_div.style.display = 'none';
}

run_hide.onclick = function(){
    localStorage.run_mode = '0'
}
run_show.onclick = function(){
    localStorage.run_mode = '1'
}

input_excel_label.onclick = function(){
    ipcRenderer.send('execute_file', localStorage.excel_path);
}

playpause.onchange = function(){
    if (playpause.checked){
        //log.value += get_time_now() +' Bắt đầu chạy'+'\n';
        let headless = run_hide.checked ? 0:1;
        if(localStorage.excel_path)
            ipcRenderer.send('start', localStorage.excel_path, receiver_id.value, headless);
        else alert("Chưa chọn file");
    }
    else{
        //log.value += get_time_now()+' Đã dừng'+'\n';
        ipcRenderer.send('stop');
    }
}
receiver_id.addEventListener('input', function(){
    localStorage.receiver_id = receiver_id.value;
})

ipcRenderer.on('show_members', (event, members)=>{
    while(table_members.rows[1])
        table_members.rows[1].remove();
    
    members = JSON.parse(members);
    for(let member of members)
        add_member_info_row(member);
});
ipcRenderer.on('log', (event, data, file_path)=>{
    if(data.includes('accounts loaded')){
        number_steam_accounts.textContent = data;
        number_steam_accounts.title = data+' from '+file_path;
    }
    //log.value += data +'\n';
});
ipcRenderer.on('show_accounts', (event, accounts)=>{
    show_accounts(JSON.parse(accounts));
});
ipcRenderer.on('update_excel_path', (event, excel_path)=>{
    localStorage.excel_path = excel_path;
    input_excel_label.textContent = excel_path.replace(/^.*[\\/]/, '')
});

function show_accounts(accounts){
    console.log(accounts);
    while(steam_accounts.firstChild)
        steam_accounts.firstChild.remove();
    for(let account of accounts){
        let account_button = document.createElement('button');
        account_button.id = account.username;
        account_button.textContent = account.username;
        account_button.className = 'steam_account';
        account_button.style.backgroundColor = account.background_color;
        account_button.title = "Nhật ký"+account.log+"\nLỗi"+account.error;
        steam_accounts.appendChild(account_button);
    }
}

async function add_member_info_row(member){
    let row = table_members.insertRow();
    let col1 = row.insertCell(0);
    let col2 = row.insertCell(1);
    let col3 = row.insertCell(2);
    let col4 = row.insertCell(3);
    let col5 = row.insertCell(4);

    let delete_member_button = document.createElement('button');
    let username = document.createElement('label');    
    let date_from = document.createElement('input');
    let date_to = document.createElement('input');
    let save = document.createElement('button');

    delete_member_button.className = 'delete_member_button';
    delete_member_button.textContent = '❎';
    delete_member_button.onclick = () =>{
        //row.remove();
        ipcRenderer.send('remove_member', member.username);
    }

    username.textContent = member.username;

    date_from.type = 'date';
    date_from.value = member.date_from;
    date_from.addEventListener('input', function(){
        save.disabled = false;
    })

    date_to.type = 'date';
    date_to.value = member.date_to;
    date_to.addEventListener('input', function(){
        save.disabled = false;
    })

    save.textContent = '💾';
    save.disabled = true;
    save.onclick = function(){
        let date_from_as_int = new Date(date_from.value).getTime();
        let date_to_as_int = new Date(date_to.value).getTime();
        ipcRenderer.send('edit_member', member.username, date_from_as_int,date_to_as_int);
    }

    ipcRenderer.on('member_updated', (event, username)=>{
        if (member.username == username)
            save.disabled = true;
    });
    col1.appendChild(delete_member_button);
    col2.appendChild(username);
    col3.appendChild(date_from);
    col4.appendChild(date_to);
    col5.appendChild(save);
    return new_member_div;
}

function get_time_now(){
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero for single-digit months
    let day = String(today.getDate()).padStart(2, '0');

    let shortDate = `${day}/${month}/${year}`;

    let hours = String(today.getHours()).padStart(2, '0');
    let minutes = String(today.getMinutes()).padStart(2, '0');

    let shortTime = `${hours}:${minutes}`;

    return shortDate + ' ' + shortTime;
}

