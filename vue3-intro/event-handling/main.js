const app = Vue.createApp({
   data() {
      return {
         cart: 0,
         product: 'Socks',
         image: './assets/images/socks_blue.jpg',
         inStock: true,
         details: ['50% cotton', '30% wool', '20% polyester'],
         variants: [
            { id: 2234, color: 'green', image: './assets/images/socks_green.jpg' },
            { id: 2235, color: 'blue', image: './assets/images/socks_blue.jpg' },
         ]
      }
   },
   methods: {
      addToCart() {
         this.cart++
      },
      updateImage(variantImage) {
         this.image = variantImage
      },
      removeFromCart() {
         if(this.cart <= 0) {
            alert('you cannot order negative items!')
            return
         } else
            this.cart--
      }
   }
})