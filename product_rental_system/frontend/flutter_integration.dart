import 'dart:convert';
import 'package:http/http.dart' as http;

// 1. Rental Product Model
class RentalProduct {
  final String id;
  final String title;
  final String description;
  final String category;
  final double rentPricePerDay;
  final double securityDeposit;
  final int minimumRentalDays;
  final String ownerId;
  final List<String> images;
  final String location;
  final String availabilityStatus;
  final double rating;

  RentalProduct({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.rentPricePerDay,
    required this.securityDeposit,
    required this.minimumRentalDays,
    required this.ownerId,
    required this.images,
    required this.location,
    required this.availabilityStatus,
    this.rating = 0.0,
  });

  factory RentalProduct.fromJson(Map<String, dynamic> json) {
    return RentalProduct(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      rentPricePerDay: (json['rentPricePerDay'] as num).toDouble(),
      securityDeposit: (json['securityDeposit'] as num? ?? 0).toDouble(),
      minimumRentalDays: json['minimumRentalDays'] ?? 1,
      ownerId: json['ownerId'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['location'] ?? '',
      availabilityStatus: json['availabilityStatus'] ?? 'available',
      rating: (json['rating'] as num? ?? 0.0).toDouble(),
    );
  }
}

// 2. Rental Order Model
class RentalOrder {
  final String id;
  final String productId;
  final String ownerId;
  final String renterId;
  final DateTime startDate;
  final DateTime endDate;
  final int totalDays;
  final double totalAmount;
  final String status;
  final String paymentStatus;

  RentalOrder({
    required this.id,
    required this.productId,
    required this.ownerId,
    required this.renterId,
    required this.startDate,
    required this.endDate,
    required this.totalDays,
    required this.totalAmount,
    required this.status,
    required this.paymentStatus,
  });

  factory RentalOrder.fromJson(Map<String, dynamic> json) {
    return RentalOrder(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      ownerId: json['ownerId'] ?? '',
      renterId: json['renterId'] ?? '',
      startDate: DateTime.parse(json['startDate']['_seconds'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['startDate']['_seconds'] * 1000).toIso8601String()
          : json['startDate']),
      endDate: DateTime.parse(json['endDate']['_seconds'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(json['endDate']['_seconds'] * 1000).toIso8601String()
          : json['endDate']),
      totalDays: json['totalDays'] ?? 0,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      status: json['status'] ?? 'pending',
      paymentStatus: json['paymentStatus'] ?? 'pending',
    );
  }
}

// 3. API Service
class RentalApiService {
  final String baseUrl;

  RentalApiService({required this.baseUrl});

  Future<List<RentalProduct>> getAllProducts({String? category}) async {
    final response = await http.get(Uri.parse('$baseUrl/products?category=${category ?? ""}'));
    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((item) => RentalProduct.fromJson(item)).toList();
    }
    throw Exception('Failed to load products');
  }

  Future<RentalOrder> bookProduct({
    required String productId,
    required String renterId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/rent/book'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'productId': productId,
        'renterId': renterId,
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
      }),
    );
    if (response.statusCode == 201) {
      return RentalOrder.fromJson(json.decode(response.body));
    }
    throw Exception('Booking failed: ${response.body}');
  }

  Future<List<RentalOrder>> getMyBookings({required String userId, required String role}) async {
    final response = await http.get(Uri.parse('$baseUrl/rent/my-bookings?userId=$userId&role=$role'));
    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((item) => RentalOrder.fromJson(item)).toList();
    }
    throw Exception('Failed to load bookings');
  }

  Future<void> updateBookingStatus(String orderId, String status) async {
    final response = await http.put(
      Uri.parse('$baseUrl/rent/status/$orderId'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'status': status}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update status: ${response.body}');
    }
  }
}
