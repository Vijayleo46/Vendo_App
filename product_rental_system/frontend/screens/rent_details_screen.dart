import 'package:flutter/material.dart';
import '../flutter_integration.dart';

class RentDetailsScreen extends StatefulWidget {
  final RentalProduct product;

  RentDetailsScreen({required this.product});

  @override
  _RentDetailsScreenState createState() => _RentDetailsScreenState();
}

class _RentDetailsScreenState extends State<RentDetailsScreen> {
  final RentalApiService _apiService = RentalApiService(baseUrl: 'http://localhost:5000/api');
  DateTime? _startDate;
  DateTime? _endDate;

  Future<void> _selectDateRange(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: ColorScheme.light(primary: Color(0xFF002F34)),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
    }
  }

  void _handleBook() async {
    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Please select dates')));
      return;
    }

    try {
      final order = await _apiService.bookProduct(
        productId: widget.product.id,
        renterId: 'current_user_id', // Replace with real auth UID
        startDate: _startDate!,
        endDate: _endDate!,
      );
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('Success! 🎉'),
          content: Text('Your booking (ID: ${order.id}) is pending approval.'),
          actions: [
            TextButton(child: Text('OK'), onPress: () => Navigator.pop(ctx)),
          ],
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, iconTheme: IconThemeData(color: Colors.black)),
      extendBodyBehindAppBar: true,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Image.network(
              widget.product.images.isNotEmpty ? widget.product.images[0] : 'https://via.placeholder.com/400',
              height: 350,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
            Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(widget.product.category, style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
                      Row(children: [Icon(Icons.star, color: Colors.amber, size: 16), Text(' ${widget.product.rating}')]),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text(widget.product.title, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on, color: Colors.grey, size: 16),
                      Text(' ${widget.product.location}', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                  Divider(height: 40),
                  Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 10),
                  Text(widget.product.description, style: TextStyle(color: Colors.grey[700], height: 1.5)),
                  SizedBox(height: 30),
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Rent per day', style: TextStyle(fontSize: 16)),
                            Text('₹${widget.product.rentPricePerDay}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        if (widget.product.securityDeposit > 0) ...[
                          SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Security Deposit', style: TextStyle(fontSize: 16, color: Colors.grey[600])),
                              Text('₹${widget.product.securityDeposit}', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)]),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => _selectDateRange(context),
                child: Text(_startDate == null ? 'Select Dates' : 'Change Dates'),
                style: OutlinedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16)),
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: _handleBook,
                child: Text('Book Now'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF002F34),
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
