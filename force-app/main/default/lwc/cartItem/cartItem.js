import { api, LightningElement } from 'lwc';



export default class CartItem extends LightningElement {




    @api cartItem


    removeItemClicked() {
        console.log('variable---->>>', this.cartItem);

        const removeShoes = CustomEvent('shoesremove', {
            detail: this.cartItem
        });
        this.dispatchEvent(removeShoes);




    }


}