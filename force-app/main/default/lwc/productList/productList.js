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

    /*
    defaultCartID() -> getCartId() -> cartItems ,CartId, Count
    wiredRecords -> searchBeer() ->  shoesRecords
    addtocart() -> createCartItems(CartId, BeerId, Amount) 
    handleSearch() -> searchBeer(value) -> shoesRecords
    */

    connectedCallback() {
        this.defaultCartID();
    }

    defaultCartID() {

        getCartId()
            .then(data => {
                // console.log('printing default cartID Data', data);
                const wrapper = JSON.parse(data);
                if (wrapper) {
                    console.log('----->>>>printing wrapper' + wrapper);
                    this.itemsInCart = wrapper.Count;
                    this.cartId = wrapper.CartId;
                    // --------> wrapper.items = cartItems; ? where
                }
            })
            .catch(error => {
                this.cartId = undefined;
                console.log(error);
            })




    }

    @wire(searchShoes)
    wiredRecords({ error, data }) {

            this.shoesRecords = data;
            this.errors = error;


        }
        //called from UI on item click
    addToCart(event) {

        const selectedShoesId = event.detail;



        const selectShoesRecord = this.shoesRecords.find(
            shoesRecord => shoesRecord.Id === selectedShoesId
        );

        createCartItems({
                CartId: this.cartId,
                ShoesId: selectedShoesId,
                Amount: selectShoesRecord.retailPrice__c
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
            //   console.log('result', result)
            this.shoesRecords = result;
            this.errors = undefined;
        }).catch(error => {
            console.log('error', error)
            this.shoesRecords = undefined;
            this.errors = error;


        })

    }
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