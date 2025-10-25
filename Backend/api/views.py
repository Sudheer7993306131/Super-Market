from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product, Category, SubCategory, CartItem, Cart, Order, OrderItem,Wishlist,WishlistItem
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, OrderSerializer,WishlistItemSerializer
from django.shortcuts import get_object_or_404


# ------------------- Product and Category -------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Only admin users should call this in production
def add_product(request):
    data = request.data
    try:
        category = Category.objects.get(id=data.get('category_id'))
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=404)
    
    product = Product(
        name=data.get('name'),
        category=category,
        price=data.get('price'),
        stock=data.get('stock'),
        description=data.get('description', '')
    )
    product.save()
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=201)


@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_products(request):
    products = Product.objects.all().order_by('-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_products_by_subcategory(request, subcategory_name):
    subcategory = get_object_or_404(SubCategory, name=subcategory_name)
    products = Product.objects.filter(subcategory=subcategory)
    serializer = ProductSerializer(products, many=True)
    return Response({
        "subcategory": subcategory.name,
        "products": serializer.data
    })

@api_view(['GET'])
def get_products_grouped_by_subcategory(request, category_id):
    subcategories = SubCategory.objects.filter(category_id=category_id)
    result = {}
    for sub in subcategories:
        products = Product.objects.filter(subcategory=sub)
        serializer = ProductSerializer(products, many=True)
        result[sub.name] = serializer.data
    return Response(result)



@api_view(['GET'])
def get_product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    serializer = ProductSerializer(product)
    return Response(serializer.data)


# ------------------- User Authentication -------------------

@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    refresh = RefreshToken.for_user(user)
    print(refresh);
    return Response({
        'user_id': user.id,
        'username': user.username,
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    })


@api_view(['POST'])
def login_user(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        print(refresh)
        return Response({
            'user_id': user.id,
            'username': user.username,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ------------------- Cart Views -------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
    except Cart.DoesNotExist:
        return Response({'items': [], 'total_price': 0})

    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    print(user)
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))

    cart, _ = Cart.objects.get_or_create(user=user)
    product = get_object_or_404(Product, id=product_id)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    cart_item.quantity += quantity
    cart_item.save()

    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    user = request.user
    cart = get_object_or_404(Cart, user=user)
    cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
    cart_item.delete()
    return Response({'message': 'Item removed from cart'}, status=status.HTTP_204_NO_CONTENT)


# ------------------- Order Views -------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    user = request.user
    cart = get_object_or_404(Cart, user=user)
    if not cart.items.exists():
        return Response({"error": "Cart is empty"}, status=400)

    order = Order.objects.create(user=user)
    total = 0

    for item in cart.items.all():
        price = item.product.discounted_price()
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=price
        )
        total += price * item.quantity

    order.total_price = total
    order.save()

    cart.items.all().delete()  # Clear cart
    serializer = OrderSerializer(order)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_details(request, order_id):
    user = request.user
    order = get_object_or_404(Order, id=order_id, user=user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)





# Wishlist


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    items = WishlistItem.objects.filter(wishlist=wishlist)
    serializer = WishlistItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    user = request.user
    product_id = request.data.get("product_id")
    if not product_id:
        return Response({"error": "Product ID is required"}, status=400)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    wishlist, created = Wishlist.objects.get_or_create(user=user)

    # Check if product already in wishlist
    if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
        return Response({"message": "Product already in wishlist"})

    wishlist_item = WishlistItem.objects.create(wishlist=wishlist, product=product)
    return Response({"message": "Product added to wishlist"})