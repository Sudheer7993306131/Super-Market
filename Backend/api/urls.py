from django.urls import path
from . import views

urlpatterns = [
    # Product endpoints (for buyers)
    path('products/', views.get_products, name='products'),
    path('product/<int:product_id>/', views.get_product_detail, name='product_detail'),   
    path('products/subcategory/<str:subcategory_name>/', views.get_products_by_subcategory, name='products-by-subcategory'),
    path('products/category/<int:category_id>/grouped/', views.get_products_grouped_by_subcategory, name='products-by-subcategory-grouped'),  
    path('categories/<str:category_name>/subcategories/', views.get_subcategories_by_name, name='get_subcategories_by_name'),

    # Categories
    path('categories/', views.get_categories, name='categories'),
    path('subcategories/<int:category_id>/', views.get_subcategories, name="get_subcategories"),
    
    # Authentication
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/seller-login/', views.seller_login, name='seller_login'),

    # Cart
    path('cart/', views.get_cart, name='get_cart'),
    path('cart/add/', views.add_to_cart, name='add_to_cart'),
    path('cart/remove/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),

    # Order
    path('order/place/', views.place_order, name='place_order'),
    path('orders/', views.get_orders, name='get_orders'),
    path('order/<int:order_id>/', views.get_order_details, name='get_order_details'),

    # Wishlist
    path('wishlist/', views.get_wishlist, name='get_wishlist'),
    path('wishlist/add/', views.add_to_wishlist, name='add_to_wishlist'),
    path('wishlist/remove/<int:product_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),

    # Sellers
    path('seller/add-product/', views.add_product_by_seller, name="add_product_by_seller"),
    path('seller/products/', views.seller_products, name='seller_products'),
    path('seller/orders/', views.seller_orders, name="seller_orders"),
    path('seller/dashboard/', views.seller_dashboard, name='seller_dashboard'),
    path('seller/profile/', views.seller_profile, name='seller_profile'),



    # Delivery agent
    path('auth/delivery-login/', views.delivery_agent_login, name='delivery_agent_login'),
    path('delivery/orders/', views.get_assigned_orders, name='get_assigned_orders'),
    path('delivery/order/<int:assignment_id>/update/', views.update_order_status, name='update_order_status'),


    # User Address
    path('addresses/', views.get_user_addresses, name='get_user_addresses'),
    path('addresses/add/', views.add_user_address, name='add_user_address'),
    path('addresses/update/<int:pk>/', views.update_user_address, name='update_user_address'),
    path('addresses/delete/<int:pk>/', views.delete_user_address, name='delete_user_address'),



    # Admin
    path('admin/users/', views.admin_list_users, name='admin_list_users'),
    path('admin/products/', views.admin_list_products, name='admin_list_products'),
    path('admin/users/<int:user_id>/promote/seller/', views.admin_promote_to_seller, name='admin_promote_to_seller'),
    path('admin/users/<int:user_id>/promote/agent/', views.admin_promote_to_delivery_agent, name='admin_promote_to_delivery_agent'),
    path('admin/products/<int:product_id>/delete/', views.admin_delete_product, name='admin_delete_product'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin_delete_user'),
]