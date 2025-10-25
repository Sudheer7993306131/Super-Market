from django.urls import path
from . import views


urlpatterns = [
    path('product/add/', views.add_product, name='add_product'),
    path('categories/', views.get_categories, name='categories'),
    path('products/', views.get_products, name='products'),
    path('product/<int:product_id>/', views.get_product_detail, name='product_detail'),   
    path('products/subcategory/<str:subcategory_name>/', views.get_products_by_subcategory),
 
    path('products/category/<int:category_id>/grouped/', views.get_products_grouped_by_subcategory, name='products-by-subcategory'),  
        # authentication
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),

    # cart
    path('cart/', views.get_cart, name='get_cart'),
    path('cart/add/', views.add_to_cart, name='add_to_cart'),
    path('cart/remove/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),

    # order

    path('order/place/', views.place_order, name='place_order'),
    path('orders/', views.get_orders, name='get_orders'),
    path('order/<int:order_>/', views.get_order_details, name='get_order_details'),

    # Wishlist
    path('wishlist/', views.get_wishlist, name='get_wishlist'),
    path('wishlist/add/', views.add_to_wishlist, name='add_to_wishlist'),

]

