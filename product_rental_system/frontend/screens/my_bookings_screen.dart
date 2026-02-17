import 'package:flutter/material.dart';
import '../flutter_integration.dart';

class MyBookingsScreen extends StatefulWidget {
  final String userId;
  final String role; // 'renter' or 'owner'

  MyBookingsScreen({required this.userId, required this.role});

  @override
  _MyBookingsScreenState createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  final RentalApiService _apiService = RentalApiService(baseUrl: 'http://localhost:5000/api');
  late Future<List<RentalOrder>> _bookingsFuture;

  @override
  void initState() {
    super.initState();
    _bookingsFuture = _apiService.getMyBookings(userId: widget.userId, role: widget.role);
  }

  void _updateStatus(String orderId, String newStatus) async {
    try {
      await _apiService.updateBookingStatus(orderId, newStatus);
      setState(() {
        _bookingsFuture = _apiService.getMyBookings(userId: widget.userId, role: widget.role);
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Booking $newStatus')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.role == 'owner' ? 'Rental Requests' : 'My Bookings'),
        backgroundColor: Color(0xFF002F34),
      ),
      body: FutureBuilder<List<RentalOrder>>(
        future: _bookingsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text('No bookings found.'));
          }

          final bookings = snapshot.data!;
          return ListView.builder(
            padding: EdgeInsets.all(16),
            itemCount: bookings.length,
            itemBuilder: (context, index) {
              final booking = bookings[index];
              return _buildBookingCard(booking);
            },
          );
        },
      ),
    );
  }

  Widget _buildBookingCard(RentalOrder booking) {
    Color statusColor = Colors.orange;
    if (booking.status == 'approved' || booking.status == 'active') statusColor = Colors.green;
    if (booking.status == 'cancelled' || booking.status == 'completed') statusColor = Colors.grey;

    return Card(
      margin: EdgeInsets.bottom(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          ListTile(
            title: Text('Order ID: ${booking.id.substring(0, 8)}...', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('Total: ₹${booking.totalAmount} (${booking.totalDays} days)'),
            trailing: Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
              child: Text(booking.status.toUpperCase(), style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                SizedBox(width: 8),
                Text(
                  '${booking.startDate.toLocal().toString().split(' ')[0]} to ${booking.endDate.toLocal().toString().split(' ')[0]}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                ),
              ],
            ),
          ),
          if (widget.role == 'owner' && booking.status == 'pending') ...[
            Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _updateStatus(booking.id, 'approved'),
                      child: Text('Approve'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _updateStatus(booking.id, 'cancelled'),
                      child: Text('Reject'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          ],
          SizedBox(height: 12),
        ],
      ),
    );
  }
}
