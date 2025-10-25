from django.contrib import admin
from .models import Product, Category,SubCategory,CartItem,Cart,OrderItem,Order,WishlistItem,Wishlist

# Register your models
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(SubCategory)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Wishlist)
admin.site.register(WishlistItem)
