const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQClBqqK/NatmsID\nwUmVaTaEFPnxxorHUUkiEZx28OaLcqrGVrxdT/tPGHrYXMpBX25LdMAnfXbi19ui\naXRUusExup5nnbp466eStYWvrl/dPlBcwehVuYnVpKnPqSXy7ObpGV132hQ1e3uW\nYzCXuTTmyKDzfRmsDHPLM/vjANkTxM4IxLdPuIuTMWrQxsiQ22eyV3c0EfAcKiZC\nXW0/0/z8sA7OwroTgROmq8ZtCjVbq6Ed8C65Z9XTmXsFIZvXkfhkFOgkYT3s7BFB\nwHcPTWMRNxw7Jl8rFm69k5Tx1eJBA161YxAaam/JU16HuDj4PdDuon6u4V3gZsJd\nmi6ze/BDAgMBAAECggEAGRyBEgI0VplwgWrFnC805PdeKzy3fGnxk3YTlYPFyR1r\nQCANrLNRffEvLEI+YqE3YtMCtF+imhUXrkiWs5fxcvQ/S2wUZncRekEV9Sw3GS70\nwpCdHoJLp49VaayHAkarQngiIW01WwgNv84bJFNB6gZIe5SjNet1KUwhPaMw5RF0\nVxfU8wWnhz86dSCdVAEzVo0JsLD0mxeOkEAWaeJ8qnp/B1jZm9R0MYPu5kIZ6lvc\nc28xzYBoAHmley/7Z650NodBHFK8UHwJ5spgdrzV8z6vExPs3Ukvx6Am1jhxUq2z\nAMHrtbTSNDA9hgrBUDP0AUlzrZv2Upi83Cdff9vUgQKBgQDYkfHp/2uz6d0CpGfI\nrqYtHo86whi0NYv0i1IQJnJaH9fjDFgpT+lFtX1CRLlm6iyYUkoAx04ujh8zg/k2\nZqmPbAgeqREonvGACss9L+qo9MfmHYy+CV53zwSVGnF4yWh21KzhujB05cfBgqgU\naqE3YW243rz8ybRiH9+sTIz+wwKBgQDDElGTPNoehxQcE5jcuYTwpv/yrMSxBY9G\njTkeBvcdYGBabr7/SL6oA70AyIabhtjZCmWtD7tGfw2QwoQdawHaMIauJ0InRLPf\nlBv+tjcVCMRt99azhO8kTzkUs7c8robaNZShalcECkiiIkGWi2WvYNXrttCAmQmk\n7PM2N/kwgQKBgFo75NmkTJG3vRgevAdHjYF7HB5VRMnBDcEkU1rbSgX3ApJdUFZW\nL1GWHsx/qegRZedJUgAlCpQnLyTdtfZOrBNP5cowky+jmefJl4i08EbZRnjAkyWS\n7cNpg/VEAUdcU6Q/VJDwbMQoASTFdZacHvPeKkM+uutwdzHzKdS2SIDVAoGAOWky\nyPqn10Q6DulVm+Cd15XOzkU6vj68pC78GHJEWEj9EqB1Zfyq4Bf5kDl0JGHTgE0n\nD4AJxf2uqGQXLfFIYkbV3HuBZL07kxmsA5LtMyuZZCQE9GCzYSRP0F/0Fc/nsGEE\nlV0Orwm3xr/+PahZDPya+Pyc8LwZsohqLBLdLAECgYEAvl2+D1cdrOjDl+ghU3zQ\n6w6VH3O8l5AjcFGkcnbWPXQ2PlMMsG85MS9YjJPJLlyE7evT0qyEA2HvJfOSWv49\nXAWr4AP+6L0yKW0Swg2kUM4XcH3R4MU04o2N3vKmRPjaN7oUVxVlRSNBHXb/tVMJ\nyw/vfHT3KOAzzGnScL42iUw=\n-----END PRIVATE KEY-----\n'
const CLIENT_EMAIL = "members-manager@csgoprime-claim-coin.iam.gserviceaccount.com"
const key = 1634612436234659;
const mod = 211410230207201;
var sha256 = function r(o){function f(r,o){return r>>>o|r<<32-o}for(var t,n,a=Math.pow,c=a(2,32),e="length",i="",h=[],u=8*o[e],v=r.h=r.h||[],l=r.k=r.k||[],s=l[e],g={},k=2;s<64;k++)if(!g[k]){for(t=0;t<313;t+=k)g[t]=k;v[s]=a(k,.5)*c|0,l[s++]=a(k,1/3)*c|0}for(o+="";o[e]%64-56;)o+="\0";for(t=0;t<o[e];t++){if((n=o.charCodeAt(t))>>8)return;h[t>>2]|=n<<(3-t)%4*8}for(h[h[e]]=u/c|0,h[h[e]]=u,n=0;n<h[e];){var d=h.slice(n,n+=16),p=v;for(v=v.slice(0,8),t=0;t<64;t++){var w=d[t-15],A=d[t-2],C=v[0],M=v[4],S=v[7]+(f(M,6)^f(M,11)^f(M,25))+(M&v[5]^~M&v[6])+l[t]+(d[t]=t<16?d[t]:d[t-16]+(f(w,7)^f(w,18)^w>>>3)+d[t-7]+(f(A,17)^f(A,19)^A>>>10)|0);(v=[S+((f(C,2)^f(C,13)^f(C,22))+(C&v[1]^C&v[2]^v[1]&v[2]))|0].concat(v))[4]=v[4]+S|0}for(t=0;t<8;t++)v[t]=v[t]+p[t]|0}for(t=0;t<8;t++)for(n=3;n+1;n--){var b=v[t]>>8*n&255;i+=(b<16?0:"")+b.toString(16)}return i};

class MembersManager{
    constructor(sheetId){
        let serviceAccountAuth = new JWT({
            email: CLIENT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        this.sheet = null;
    }
    async loadInfo(){
        await this.doc.loadInfo(); 
        this.sheet = this.doc.sheetsByIndex[0];    
    }

    async add_member (username, password, from_date, to_date){
        try {
            await this.sheet.addRow(
                {
                    "username": username,
                    "password": sha256(password),
                    "date_from": (parseInt(from_date) + key) % mod,
                    "date_to": (parseInt(to_date) + key) % mod,
                });
            console.log('Writing data to Google Sheet succeeds!')
            return true;
        }
        catch (e) {
            console.log('Oops! Something wrongs, check logs console for detail ... ', e)
            return false;
        }
    }
    async update_member(username, from_date, to_date){
        let rows = await this.sheet.getRows(); 
        for(let i=0;i<rows.length;++i)
            if(rows[i].get('username') == username){
                rows[i].set('date_from', (parseInt(from_date) + key) % mod); 
                rows[i].set('date_to', (parseInt(to_date) + key) % mod);
                await rows[i].save();
                return true;
            }
        return false;
    }
    async remove_member(username){
        let rows = await this.sheet.getRows(); 
        for(let i=0;i<rows.length;++i)
            if(rows[i].get('username') == username){
                await rows[i].delete();
                return true;
            }
        return false;
    }
    async check_member(username, password){
        let rows = await this.sheet.getRows(); 
        for(let i=0;i<rows.length;++i)
            if(rows[i].get('username') == username)
                if(rows[i].get('password') == sha256(password))
                    return true;
        return false;
    }
    async get_members(){
        let res = [];
        let rows = await this.sheet.getRows(); 
        for(let i=0;i<rows.length;++i){
            try{
                let tmp_row = rows[i].toObject();
                tmp_row.date_from = (parseInt(tmp_row.date_from) - key) % mod;
                tmp_row.date_to = (parseInt(tmp_row.date_to) - key) % mod;
                tmp_row.date_from = (tmp_row.date_from + mod) % mod;
                tmp_row.date_to = (tmp_row.date_to + mod) % mod;

                console.log(tmp_row.date_from);
                console.log(tmp_row.date_to)
                tmp_row.date_from = new Date(tmp_row.date_from).toISOString().substring(0,10);
                tmp_row.date_to = new Date(tmp_row.date_to).toISOString().substring(0,10);
                res.push(tmp_row);
            }catch(err){}
        }
        return res;
    }
}
module.exports = MembersManager;
