public class KickerSneakersController {
    
    public KickerSneakersController() {

    }

    public static String generateCardId(){
        String CharList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
        Integer position;
        Integer LengthRequired = 30;
        String Res = '';
        for(Integer i = 0; i <= LengthRequired; i++) {
            position = Integer.valueof(String.valueof(Math.roundToLong(CharList.length()*Math.random()))) -1;
            Res += CharList.substring(position,position+1);
        }
        return Res;
    }

    public static String getCouponInformation(String name){
        Coupon__c couponRec = [Select Id, Name, 
                                Price__c 
                                FROM Coupon__c 
                                Where Expired__c = false
                                AND Name =: name];
        return couponRec.Id;
    }
    @AuraEnabled
    public static Coupon__c applyCoupon(String name) {

        Coupon__c couponRec;
         for (Coupon__c cr: [Select Id, Name, 
        Price__c 
        FROM Coupon__c 
        Where Expired__c = false
        AND Name =: name]){
            couponRec = cr;

        }
        System.debug('your coupon data ===>: ' + couponRec);
        return couponRec;
        
       

        
    }

    @AuraEnabled
    public static string createCartItems(String CartId, String ShoesId, Decimal Amount,String ThumbURL){
        
  
        
        SCart_Item__c item = new SCart_Item__c();
        
        item.Item_Quantity__c = 0;
         
        SCart_Item__c[] cItem = [SELECT Id, Item_Amount__c, Item_Quantity__c, Cart__c, Shoes__c 
                               FROM SCart_Item__c WHERE Shoes__c = :ShoesId];
        
         if(cItem.size() > 0){
            item.Id = cItem[0].Id;
           // item.Cart__c = cItem[0].CartId;
            item.Item_Quantity__c = cItem[0].Item_Quantity__c + 1;
            item.Item_Amount__c = Amount;
            update item;
            //system.debug('printing item.Id conditional...' + cItem[0].Item_Amount__c );
            return item.Id;


         }
         else {
            item.Shoes__c = ShoesId;
            item.Cart__c = CartId;
            item.Item_Quantity__c = 1;
            item.Item_Amount__c = Amount;
            item.thumbUrl__c = ThumbURL;
            insert item;
           // system.debug('printing item.Id...' + item.Id);
            return item.Id;
             
         }
   
    }
    
    
   @AuraEnabled(Cacheable=false)
   public static Boolean removeItemFromCart(String shoesName){
    System.debug('printing shoes name : ' + shoesName);

    List<Cart__c> cartInfo = [ Select Id, Name 
    FROM Cart__c 
    Where User__c =: UserInfo.getUserId()
    AND Cart_Status__c = 'Open'
    AND Is_Active__c = true];
if (cartInfo != null && cartInfo.size() > 0) {
List<SCart_Item__c> cartItem = new list<SCart_Item__c>();
cartItem = [Select Id, Name, Shoes__c,Shoes__r.Name, Cart__c, Item_Quantity__c, Item_Amount__c
    FROM SCart_Item__c
    Where Cart__c =: cartInfo.get(0).Id AND Shoes__r.Name =: shoesName]; //???????
     System.debug('items in cart cartItem: ' + cartItem);
    delete cartItem.get(0);
    return true;
}

    return false;
    

   }

    @AuraEnabled(cacheable=false)
    public static string getCartId(){
       
        List<Cart__c> cartInfo = [ Select Id, Name 
                                FROM Cart__c 
                                Where User__c =: UserInfo.getUserId()
                                AND Cart_Status__c = 'Open'
                                AND Is_Active__c = true];
        if (cartInfo != null && cartInfo.size() > 0) {
            List<SCart_Item__c> cartItems = new list<SCart_Item__c>();
            cartItems = [Select Id, Name, Shoes__c,Shoes__r.Name, Cart__c, Item_Quantity__c, Item_Amount__c, thumbUrl__c
                                FROM SCart_Item__c
                                Where Cart__c =: cartInfo.get(0).Id]; //???????
            
                                Decimal amount = 0;
                                
               for (SCart_Item__c cic:cartItems){
                   
                    amount = amount + cic.Item_Quantity__c;

               }
                   
 
            CartWrapper wrapper = new CartWrapper();
            wrapper.CartId = cartInfo.get(0).Id;
            wrapper.items = cartItems;
            wrapper.Count = amount;
          //  wrapper.Beer_Name = 
            return JSON.serialize(wrapper);
        } else { 
             system.debug('default cart logic ...' );
            Cart__c defaultCart = new Cart__c();
             system.debug('before default'  );
            String couponId = getCouponInformation('Default');
             system.debug('default coupon id ...' +  getCouponInformation('Default') );
            defaultCart.Cart_Id__c = String.valueOf(Math.random());
            defaultCart.Cart_Status__c = 'Open';
            defaultCart.Is_Active__c = true;
            defaultCart.Coupon__c = couponId;
            defaultCart.User__c = UserInfo.getUserId();
             system.debug('default cart to be inserted ...' + defaultCart );
            insert defaultCart;
            CartWrapper wrapper = new CartWrapper();
            wrapper.CartId = defaultCart.Id;
            wrapper.items = null;
            wrapper.Count = 0;
            
            return JSON.serialize(wrapper);
           
        }                        
    }
     //random comment
    @AuraEnabled(cacheable=true)
    public static List<sObject> searchShoes(String searchParam){
        String likeParam = '%' +searchParam+'%';
        String Query = '';
        /*
            Select Id, Name From beer__c Where Name Like '%aa%'
        */
        if(searchParam != null){
           Query  = 'SELECT Brand__C, colorway__c, gender__C, imageUrl__c, releaseDate__c, retailPrice__c, ShoesID__c,shoeVersion__c,smallImageUrl__c,styleId__c, thumbUrl__c, title__c, year__c, Name  FROM Shoes__C Where Name Like :likeParam LIMIT 50';
        }else{
           Query  = 'SELECT Brand__C, colorway__c, gender__C, imageUrl__c, releaseDate__c, retailPrice__c, ShoesID__c,shoeVersion__c,smallImageUrl__c,styleId__c, thumbUrl__c, title__c, year__c, Name  FROM Shoes__C LImit 50'; 
        }
        
        List<SObject> sObjectList = Database.query(Query);
        return sObjectList;
    }

    public class CartWrapper {
        @AuraEnabled
        public String CartId                { get; set; }
        @AuraEnabled
        public Decimal Count                { get; set; }
        @AuraEnabled
        public List<SCart_Item__c> items     { get; set; }
        @AuraEnabled
        public String Shoes_Name                { get; set; }
    }

    }

