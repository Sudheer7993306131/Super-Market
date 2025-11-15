from rest_framework import serializers
from .models import Product, Category, SubCategory, Cart, CartItem, Order, OrderItem, WishlistItem, Wishlist, Seller, DeliveryAgent, DeliveryAssignment, UserAddress, User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class SubCategorySerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'category']


class SellerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Seller
        fields = ['id', 'username', 'email', 'store_name', 'contact_number', 'address', 'is_verified', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField()
    seller_details = SellerSerializer(source='seller', read_only=True)
    seller_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'subcategory', 'price', 'discount_percentage',
            'stock', 'description', 'image', 'discounted_price', 'seller', 
            'seller_details', 'seller_name'
        ]

    def get_discounted_price(self, obj):
        return obj.discounted_price()
    
    def get_seller_name(self, obj):
        if obj.seller:
            return obj.seller.store_name
        return None
    
    def get_product_image(self, obj):
        request = self.context.get('request')
        if obj.product_image:
            return request.build_absolute_uri(obj.product_image.url)
        return None


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'discounted_price', 'quantity']

    def get_discounted_price(self, obj):
        return obj.product.discounted_price()


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'created_at']

    def get_total_price(self, obj):
        return obj.total_price()


# Order
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.total_price()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_price', 'created_at', 'is_paid']


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'added_at']

# User Address
class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = "__all__"

class DeliveryAgentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = DeliveryAgent
        fields = ['id', 'username', 'phone', 'vehicle_number', 'current_location', 'is_active']


class DeliveryOrderSerializer(serializers.ModelSerializer):
    user_address = UserAddressSerializer(source='address', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'customer_name', 'total_price', 'status', 'assigned_at', 'user_address']

class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    customer_name = serializers.CharField(source='order.user.username', read_only=True)
    total_price = serializers.DecimalField(source='order.total_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = DeliveryAssignment
        fields = ['id', 'order_id', 'customer_name', 'total_price', 'status', 'assigned_at', 'last_updated']


# User Address


class UserListSerializer(serializers.ModelSerializer):
    is_seller = serializers.SerializerMethodField()
    is_delivery_agent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_superuser', 'is_seller', 'is_delivery_agent', 'date_joined']

    def get_is_seller(self, obj):
        return hasattr(obj, 'seller_profile')

    def get_is_delivery_agent(self, obj):
        return hasattr(obj, 'delivery_agent_profile')