import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

class IranhostCom {
    static BASE_URL = 'https://iranhost.com/';

    constructor(IH_ANTIFORGERYTOKEN = false) {
        this.IH_ANTIFORGERYTOKEN = IH_ANTIFORGERYTOKEN;
    }

    getIhAntiforgerytoken = async () => this.IH_ANTIFORGERYTOKEN = await fetch(IranhostCom.BASE_URL + 'whois/').then(r => r.text()).then(html => (new JSDOM(html)).window.document.querySelector('meta[name="ihaft"]').content);

    checkDomain = async (domain, tlds = ['.com', '.net', '.biz', '.co', '.ir'], retry = true) => {
        if (!this.IH_ANTIFORGERYTOKEN) await this.getIhAntiforgerytoken();

        let get = () => fetch(IranhostCom.BASE_URL + 'api/v1/shared/whois/check-domain', {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'ih-antiforgerytoken': this.IH_ANTIFORGERYTOKEN
            },
            body: JSON.stringify({ domain, tlds }),
            method: 'POST'
        });

        let r = await get();
        if (retry && (r.status == 401)) {
            this.IH_ANTIFORGERYTOKEN = false;
            return await this.checkDomain(domain, tlds, false);
        }

        return await r.json();
    };
}

(async () => {
    let iranhost_com = new IranhostCom();
    let domain = 'github.com';
    console.log(`Check '${domain}' with iranhost.com:`, await iranhost_com.checkDomain(domain));
})();