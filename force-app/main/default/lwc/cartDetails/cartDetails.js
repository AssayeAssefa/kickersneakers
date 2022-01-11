import { api, LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getCartId from '@salesforce/apex/KickerSneakersController.getCartId';
import { NavigationMixin } from 'lightning/navigation';
import removeItemFromCart from '@salesforce/apex/KickerSneakersController.removeItemFromCart';
import applyCoupon from '@salesforce/apex/KickerSneakersController.applyCoupon'

export default class CartDetails extends NavigationMixin(LightningElement) {

    objWrapper = {}
    itemsInCart;
    cartId;
    cartItemsArray = [];
    numberShoesTypes;
    subTotalPrice;
    boolVisible = false;
    couponValue
    showCouponConfirmation = false;
    couponnotworking = false;


    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.cartId = currentPageReference.state.c__cartId;

    }


    constructor() {
            super();
            this.defaultCartID();

        }
        // review -
        // always identify/grab records by id 
        // method doing too many functions 
    defaultCartID() {
        this.numberShoesTypes = 0;
        this.subTotalPrice = 0; //temporary - this amount should come from backend
        getCartId()
            .then(data => {
                // console.log('printing arw data ===>', data);
                const wrapper = JSON.parse(data);
                if (wrapper) {
                    console.log('printing wrapper ===>', wrapper);
                    this.itemsInCart = wrapper.Count;
                    this.cartId = wrapper.CartId;
                    //wrapper.items = wrapper.items; 

                    console.log('printing wrapper', wrapper);
                    //-------------->>>>>>>>review <<<<<<<<<<-------------------
                    wrapper.items.forEach(element => {
                        //create an object
                        this.objWrapper = {
                            Name: element.Shoes__r.Name,
                            Quantity: element.Item_Quantity__c,
                            Price: element.Item_Amount__c,
                            Thumb: element.thumbUrl__c
                        };
                        //push object to array as well as  update vars
                        this.subTotalPrice = this.subTotalPrice + (this.objWrapper.Price * this.objWrapper.Quantity);
                        this.cartItemsArray.push(this.objWrapper);
                        this.numberShoesTypes = this.numberShoesTypes + this.objWrapper.Quantity; //why??
                    });



                }
                console.log('items in cartItemsArray', this.cartItemsArray[0].Name);


            })
            .catch(error => {
                this.cartId = undefined;
                console.log(error);
            })




    }
    continueShoppingClicked() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'KickerSneaker'

            },

        });

    }
    showClicked() {

        this.boolVisible = !this.boolVisible;

    }

    handleCouponSubmission(event) {

        const couponCode = this.template.querySelector('lightning-input').value;
        console.log(couponCode);

        applyCoupon({ name: couponCode }).then(data => {
            console.log('priting coupon data:', data);
            if (data) {
                this.couponValue = data.Price__c;
                this.subTotalPrice = this.subTotalPrice - data.Price__c;
                this.showCouponConfirmation = true;
                this.couponnotworking = false;


            } else {
                this.showCouponConfirmation = false;
                this.couponnotworking = true;
            }


        }).catch(error => { console.log('oh no errrorrr:', error); })



    }

    // Review - this could have been simplified using uiRecordApi - deleteRecord
    shoesRemoveClicked(event) {

        console.log('variable:', event.detail.Name);
        removeItemFromCart({ shoesName: event.detail.Name }).then(
            data => {

                this.cartItemsArray = this.cartItemsArray.filter(shoes =>

                    shoes.Name !== event.detail.Name
                )
                this.subTotalPrice = this.subTotalPrice - (event.detail.Price * event.detail.Quantity);
                this.numberShoesypes = this.numberShoesTypes - event.detail.Quantity;

                console.log("printing updated array ===>", this.cartItemsArray)
            }).catch(
            error => { console.log("oh no :[", error) })



        // this.objWrapper = {}
        // this.itemsInCart = 0;
        // this.cartId = null;
        // cartItemsArray = [];
        // numberShoesTypes = 0;
        // subTotalPrice = 0;




    }

}