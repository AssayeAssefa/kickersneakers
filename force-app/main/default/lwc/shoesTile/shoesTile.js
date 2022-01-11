import { api, LightningElement, track } from 'lwc';

export default class ShoesTile extends LightningElement {

    @api shoesRecord;
    handleAddToCart(event) {



        const addtocart = CustomEvent('cart', {
            detail: this.shoesRecord.Id
        });
        this.dispatchEvent(addtocart);

    }
}