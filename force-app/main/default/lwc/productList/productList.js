import getCartId from '@salesforce/apex/KickerSneakersController.getCartId';
import searchShoes from '@salesforce/apex/KickerSneakersController.searchShoes';
import { LightningElement, track, wire } from 'lwc';
import cartIco from '@salesforce/resourceUrl/cart';
import createCartItems from '@salesforce/apex/KickerSneakersController.createCartItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class ProductList extends NavigationMixin(LightningElement) {

    @track shoesRecords
    @track errors
    @track cart = cartIco;
    shoescontroller
    @track cartId;
    @track itemsInCart = 0;



    connectedCallback() {
        //load cart from DB on initiation
        this.defaultCartID();
    }

    defaultCartID() {

            getCartId()
                .then(data => {

                    const wrapper = JSON.parse(data);
                    if (wrapper) {

                        this.itemsInCart = wrapper.Count;
                        this.cartId = wrapper.CartId;

                    }
                })
                .catch(error => {
                    this.cartId = undefined;
                    console.log(error);
                })




        }
        //call controller to get 50 random products on init and load shoesRecords
    @wire(searchShoes)
    wiredRecords({ error, data }) {

            this.shoesRecords = data;
            this.errors = error;


        }
        //called from UI on item click
    addToCart(event) {

        const selectedShoesId = event.detail;


        //search shoesRecords for the clicked item 
        const selectShoesRecord = this.shoesRecords.find(
            shoesRecord => shoesRecord.Id === selectedShoesId
        );

        // save items to cart 
        createCartItems({
                CartId: this.cartId,
                ShoesId: selectedShoesId,
                Amount: selectShoesRecord.retailPrice__c,
                ThumbURL: selectShoesRecord.thumbUrl__c
            })
            .then(
                data => {
                    // console.log('cart item id', data);
                    this.itemsInCart = this.itemsInCart + 1;
                    const toast = new ShowToastEvent({
                        'title': 'Success',
                        "message": selectShoesRecord.Name + 'Added into Cart!',
                        "variant": "success",
                    });
                    this.dispatchEvent(toast);

                })
            .catch(
                error => {
                    console.log(error);

                });



    }

    handleSearch(event) {

            const eventval = event.detail;

            console.log(eventval);


            //imperative way. wire method retrieves read only records
            searchShoes({ searchParam: eventval }).then(result => {

                this.shoesRecords = result;
                this.errors = undefined;
            }).catch(error => {
                console.log('error', error)
                this.shoesRecords = undefined;
                this.errors = error;


            })

        }
        //transfer user to details page 
    navigateToDetail() {

        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Cart_Details'

            },
            state: {
                c__cartId: this.cartId

            }
        });
    }

}