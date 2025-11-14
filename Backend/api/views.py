from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from .models import Product, Category, SubCategory, CartItem, Cart, Order, OrderItem,Wishlist,WishlistItem,Seller,DeliveryAssignment,DeliveryAgent,UserAddress
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, OrderSerializer,WishlistItemSerializer,SellerSerializer,SubCategorySerializer,DeliveryAgentSerializer,DeliveryAssignmentSerializer,UserAddressSerializer,UserListSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from django.utils.timesince import timesince

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
def get_subcategories(request, category_id):
    subcategories = SubCategory.objects.filter(category_id=category_id)
    serializer = SubCategorySerializer(subcategories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_subcategories_by_name(request, category_name):
    try:
        category = Category.objects.get(name__iexact=category_name)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)

    subcategories = SubCategory.objects.filter(category=category)
    serializer = SubCategorySerializer(subcategories, many=True)
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

    if user is None:
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)

    refresh = RefreshToken.for_user(user)
    print(refresh)

    # Include is_staff to check admin
    return Response({
        'user_id': user.id,
        'username': user.username,
        'is_staff': user.is_staff,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })
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
    
    # Return only product IDs
    wishlist_ids = [item.product.id for item in items]

    return Response({"wishlist": wishlist_ids})


@api_view(["POST"])
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

    if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
        return Response({"message": "Product already in wishlist"})

    WishlistItem.objects.create(wishlist=wishlist, product=product)

    return Response({"message": "Added", "product_id": product_id})



@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)

    try:
        item = WishlistItem.objects.get(wishlist=wishlist, product_id=product_id)
        item.delete()
        return Response({"message": "Removed", "product_id": product_id})
    except WishlistItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)












# Sellers page


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_seller(request):
    data = request.data
    user = request.user

    if hasattr(user, "seller_profile"):
        return Response({"message": "You are already registered as a seller."}, status=400)

    seller = Seller.objects.create(
        user=user,
        store_name=data.get("store_name"),
        phone=data.get("phone"),
        address=data.get("address")
    )
    return Response(SellerSerializer(seller).data, status=201)


# ✅ Add a product (Seller only)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product_by_seller(request):
    user = request.user
    if not hasattr(user, "seller_profile"):
        return Response({"error": "You are not registered as a seller."}, status=403)

    seller = user.seller_profile
    data = request.data

    product = Product.objects.create(
        seller=seller,
        name=data.get("name"),
        category_id=data.get("category_id"),
        subcategory_id=data.get("subcategory_id"),
        price=data.get("price"),
        stock=data.get("stock"),
        discount_percentage=data.get("discount_percentage", 0),
        description=data.get("description", ""),
        image=data.get("image")
    )
    return Response(ProductSerializer(product).data, status=201)


# ✅ Get all products of the seller

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_products(request):
    try:
        # Check if seller exists
        seller = Seller.objects.filter(user=request.user).first()
        if not seller:
            return Response(
                {"error": "Seller profile not found for this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get seller's products
        products = Product.objects.filter(seller=seller)
        serializer = ProductSerializer(products, many=True)
        

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ✅ Get all orders received by the seller
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_orders(request):
    try:
        # Get the logged-in user
        user = request.user

        # Method 1: Using try-except (more explicit)
        try:
            seller = Seller.objects.filter(user=request.user).first()
        except Seller.DoesNotExist:
            return Response({"error": "Seller not found for this user"}, status=404)

        # Method 2: Using get_object_or_404 (alternative)
        # from django.shortcuts import get_object_or_404
        # seller = get_object_or_404(Seller, user=user)

        # More efficient query with select_related and prefetch_related
        orders = Order.objects.filter(
            items__product__seller=seller
        ).distinct().select_related('user').prefetch_related('items', 'items__product')

        # Check if orders exist
        if not orders.exists():
            return Response({"message": "No orders found for your products"}, status=200)

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# seller login
@api_view(['POST'])
def seller_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the user is in Seller table and verified
    try:
        seller = Seller.objects.get(user=user)
        if not seller.is_verified:
            return Response({'error': 'Your seller account is not verified yet.'}, status=status.HTTP_403_FORBIDDEN)
    except Seller.DoesNotExist:
        return Response({'error': 'You are not registered as a seller.'}, status=status.HTTP_403_FORBIDDEN)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        'user_id': user.id,
        'username': user.username,
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    })

# seller dashboard
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum
from django.utils.timesince import timesince
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product, Order, Seller

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_dashboard(request):
    user = request.user

    # Get seller instance
    try:
        seller = Seller.objects.get(user=user)
    except Seller.DoesNotExist:
        return Response({"error": "Seller profile not found"}, status=404)

    # --- PRODUCT STATS ---
    total_products = Product.objects.filter(seller=seller).count()

    # --- ORDER STATS ---
    pending_orders = Order.objects.filter(
        items__product__seller=seller,
        is_paid=False  # or status='pending' if you have that field
    ).distinct().count()

    completed_orders = Order.objects.filter(
        items__product__seller=seller,
        is_paid=True,  # or status='completed'
        created_at__gte=timezone.now() - timedelta(days=30)
    ).distinct().count()

    total_revenue = (
        Order.objects.filter(
            items__product__seller=seller,
            is_paid=True  # or status='completed'
        ).aggregate(total=Sum('total_price'))['total'] or 0
    )

    # --- STATS LIST ---
    stats = [
        {'key': 'total_products', 'value': str(total_products), 'change': '+12%', 'color': 'green', 'icon': '📦', 'description': 'Active in store'},
        {'key': 'pending_orders', 'value': str(pending_orders), 'change': '+5%', 'color': 'blue', 'icon': '⏳', 'description': 'Need attention'},
        {'key': 'completed_orders', 'value': str(completed_orders), 'change': '+23%', 'color': 'purple', 'icon': '✅', 'description': 'This month'},
        {'key': 'total_revenue', 'value': f'${total_revenue:,.2f}', 'change': '+18%', 'color': 'orange', 'icon': '💰', 'description': 'All time sales'}
    ]

    # --- RECENT ACTIVITIES ---
    recent_activities = []
    recent_orders = Order.objects.filter(items__product__seller=seller).distinct().order_by('-created_at')[:5]
    for order in recent_orders:
        recent_activities.append({
            'id': order.id,
            'activity': f'New order #{order.id} received',
            'time': timesince(order.created_at) + ' ago',
            'type': 'order',
            'status': 'success'
        })

    return Response({
        'stats': stats,
        'recent_activities': recent_activities,
        'user': {
            'username': user.username,
            'store_name': seller.store_name if hasattr(seller, 'store_name') else '',
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seller_profile(request):
    user = request.user
    try:
        seller = Seller.objects.get(user=user)
    except Seller.DoesNotExist:
        return Response({"error": "Seller profile not found"}, status=404)

    return Response({
        'username': user.username,
        'email': user.email,
        'store_name': seller.store_name if hasattr(seller, 'store_name') else '',
    })



# Delivery agent


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assigned_orders(request):
    """
    Delivery agent retrieves all orders assigned to them.
    """
    user = request.user
    try:
        agent = user.delivery_agent_profile
    except DeliveryAgent.DoesNotExist:
        return Response({"error": "You are not a registered delivery agent."}, status=status.HTTP_403_FORBIDDEN)

    assignments = DeliveryAssignment.objects.filter(delivery_agent=agent).order_by('-assigned_at')
    serializer = DeliveryAssignmentSerializer(assignments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_status(request, assignment_id):
    """
    Delivery agent updates the status of an assigned order.
    """
    user = request.user
    try:
        agent = user.delivery_agent_profile
    except DeliveryAgent.DoesNotExist:
        return Response({"error": "You are not a registered delivery agent."}, status=status.HTTP_403_FORBIDDEN)

    try:
        assignment = DeliveryAssignment.objects.get(id=assignment_id, delivery_agent=agent)
    except DeliveryAssignment.DoesNotExist:
        return Response({"error": "Order not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ['Pending', 'Out for Delivery', 'Delivered']:
        return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

    assignment.status = new_status
    assignment.save()

    return Response(
        {"message": f"Order #{assignment.order.id} status updated to {assignment.status}"},
        status=status.HTTP_200_OK
    )





@api_view(['POST'])
def delivery_agent_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if the user exists in DeliveryAgent table
    try:
        delivery_agent = DeliveryAgent.objects.get(user=user)
        if not delivery_agent.is_active:
            return Response({'error': 'Your delivery account is not active. Contact admin.'}, status=status.HTTP_403_FORBIDDEN)
    except DeliveryAgent.DoesNotExist:
        return Response({'error': 'You are not registered as a delivery agent.'}, status=status.HTTP_403_FORBIDDEN)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        'user_id': user.id,
        'username': user.username,
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    }, status=status.HTTP_200_OK)


















# user Address

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_addresses(request):
    addresses = UserAddress.objects.filter(user=request.user)
    serializer = UserAddressSerializer(addresses, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_address(request):
    serializer = UserAddressSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_address(request, pk):
    try:
        address = UserAddress.objects.get(pk=pk, user=request.user)
    except UserAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserAddressSerializer(address, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_address(request, pk):
    try:
        address = UserAddress.objects.get(pk=pk, user=request.user)
    except UserAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    address.delete()
    return Response({'message': 'Address deleted successfully'}, status=status.HTTP_204_NO_CONTENT)







# Admin

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_users(request):
    users = User.objects.all().order_by('-date_joined')
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_products(request):
    products = Product.objects.all().order_by('-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_promote_to_seller(request, user_id):
    """
    Create Seller entry for a user (if not exists).
    Request body may include store_name and contact_number (optional).
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if hasattr(user, 'seller_profile'):
        return Response({'error': 'User already a seller'}, status=status.HTTP_400_BAD_REQUEST)

    store_name = request.data.get('store_name') or f"{user.username}'s store"
    contact_number = request.data.get('contact_number', '')

    seller = Seller.objects.create(user=user, store_name=store_name, contact_number=contact_number)
    return Response({'message': 'User promoted to seller', 'seller_id': seller.id}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_promote_to_delivery_agent(request, user_id):
    """
    Create DeliveryAgent entry for a user (if not exists).
    Request body may include phone, vehicle_number.
    """
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if hasattr(user, 'delivery_agent_profile'):
        return Response({'error': 'User already a delivery agent'}, status=status.HTTP_400_BAD_REQUEST)

    phone = request.data.get('phone', '')
    vehicle_number = request.data.get('vehicle_number', '')

    agent = DeliveryAgent.objects.create(user=user, phone=phone, vehicle_number=vehicle_number)
    return Response({'message': 'User promoted to delivery agent', 'agent_id': agent.id}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_product(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    product.delete()
    return Response({'message': 'Product deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Prevent deleting superuser or staff accidentally
    if user.is_superuser:
        return Response({'error': 'Cannot delete superuser'}, status=status.HTTP_403_FORBIDDEN)

    user.delete()
    return Response({'message': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)