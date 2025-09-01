# Useful Information Page - UI/UX Design

## Overview
Design for a comprehensive bus company information and resources page that integrates seamlessly with the existing LateAgain app flow.

## Screen Structure

### Main Screen Layout
```
┌─────────────────────────────────┐
│         Useful Information      │
├─────────────────────────────────┤
│ [Search Bar]                    │
├─────────────────────────────────┤
│ 🚌 BUS COMPANIES (3)            │
│ ├─ First Bus                   │
│ ├─ Stagecoach                  │
│ └─ Lothian Buses               │
├─────────────────────────────────┤
│ 🏛️ REGULATORY BODIES (3)        │
│ ├─ Bus Users Scotland          │
│ ├─ Traffic Commissioner        │
│ └─ DVSA                        │
├─────────────────────────────────┤
│ ℹ️ USEFUL INFO (5)              │
│ ├─ Passenger Rights            │
│ ├─ Reporting Issues            │
│ ├─ Accessibility               │
│ ├─ Fare Information            │
│ └─ Safety Guidelines           │
└─────────────────────────────────┘
```

## Component Design

### Search and Filter Bar
- Top-positioned search input with magnifying glass icon
- Filter chips for categories: All, Companies, Regulatory, Info
- Real-time search as user types
- Clear search button when text is entered

### Information Cards
Each entry displays as a card with:
- **Header**: Name/Title with appropriate icon
- **Contact Info**: Clickable email, phone, website links
- **Description**: Brief overview or key information
- **Category Badge**: Visual indicator (Bus Company/Regulatory/Info)
- **Priority Indicator**: For companies (MUST/SHOULD/COULD)

### Contact Information UX
- **Email**: `mailto:` links that open email client
- **Phone**: `tel:` links that initiate calls
- **Website**: Opens in-app browser or external browser
- **Web Forms**: For companies without direct emails, provide links to contact forms
- **Alternative Contact**: Clear indication when email is not available, with preferred alternatives
- **Address**: Clickable for maps integration (future)

## Navigation Integration

### Home Screen Addition
Add "Useful Information" button to HomeScreen:
```
┌─────────────────────────────────┐
│         Late Again             │
├─────────────────────────────────┤
│ [Manage Companies]             │
│ [Quick Reporting]              │
│ [Useful Information] ← NEW     │
│ [Sign Out]                     │
└─────────────────────────────────┘
```

### App Navigation
Update App.tsx to include:
```typescript
<Stack.Screen name="UsefulInfo" component={UsefulInfoScreen} />
```

## Detailed Card Design

### Bus Company Card
```
┌─────────────────────────────────┐
│ 🚌 First Bus                   │
│ MUST                           │
├─────────────────────────────────┤
│ 📧 customer.services@first...  │
│ 📞 0344 800 4411              │
│ 🌐 www.firstbus.co.uk          │
│ 📍 Aberdeen, UK                │
├─────────────────────────────────┤
│ Major bus operator across UK   │
└─────────────────────────────────┘
```

### Regulatory Body Card
```
┌─────────────────────────────────┐
│ 🏛️ Bus Users Scotland          │
├─────────────────────────────────┤
│ 📧 info@bususersscotland.org.uk │
│ 📞 0141 332 9988               │
│ 🌐 www.bususersscotland.org.uk  │
│ 📍 Glasgow, Scotland           │
├─────────────────────────────────┤
│ Scottish bus passenger watchdog│
└─────────────────────────────────┘
```

### Useful Info Card
```
┌─────────────────────────────────┐
│ ℹ️ Passenger Rights             │
│ Category: Rights & Entitlements│
├─────────────────────────────────┤
│ Under UK law, bus passengers   │
│ have rights to reliable service│
│ compensation for delays, and   │
│ assistance for disabled...     │
│                                │
│ [Read More]                    │
└─────────────────────────────────┘
```

## Interaction Design

### Tap Actions
- **Company/Regulatory Cards**: Expand to show full details
- **Useful Info Cards**: Expand to show full content
- **Contact Links**: Open appropriate apps (email, phone, browser)
- **Search Results**: Filter list in real-time

### Visual States
- **Pressed**: Slight opacity reduction
- **Focused**: Border highlight for accessibility
- **Selected**: Background color change
- **Loading**: Skeleton screens or spinners

## Accessibility Features

### Screen Reader Support
- Proper accessibility labels for all interactive elements
- Semantic headings for sections
- Descriptive text for icons
- Focus management for keyboard navigation

### Touch Targets
- Minimum 44x44pt touch targets
- Adequate spacing between elements
- Clear visual feedback for interactions

### Color and Contrast
- High contrast text on backgrounds
- Color-blind friendly color schemes
- Alternative text indicators for color-coded elements

## Responsive Design

### Mobile Optimization
- Single column layout
- Optimized for thumb navigation
- Swipe gestures for category switching
- Bottom sheet for detailed information

### Tablet/Desktop Considerations
- Multi-column layout possible
- Larger touch targets
- Keyboard shortcuts
- Hover states

## Performance Considerations

### Data Loading
- Lazy load detailed information
- Cache frequently accessed data
- Progressive loading of images/icons
- Offline capability for core information

### Search Optimization
- Client-side search for immediate results
- Debounced search input
- Indexed search fields
- Fuzzy matching for typos

## Integration with Existing Flow

### Quick Reporting Enhancement
- Link from QuickReporting to company details
- Pre-populate company selection from Useful Info
- Cross-reference contact information

### Admin Interface
- Edit buttons for admin users
- Add new entries functionality
- Bulk update capabilities
- Data validation and approval workflow

## Future Enhancements

### Advanced Features
- **Maps Integration**: Show company locations
- **Favorites**: Save frequently used contacts
- **Offline Mode**: Core information available offline
- **Push Notifications**: Updates to contact information
- **User Feedback**: Report incorrect information

### Analytics
- Track most viewed information
- Monitor search patterns
- Measure user engagement
- Identify information gaps

## Implementation Priority

### Phase 1: Core Functionality
1. Basic list view with search
2. Contact information display
3. Category filtering
4. Navigation integration

### Phase 2: Enhanced UX
1. Detailed card expansions
2. Advanced search features
3. Accessibility improvements
4. Performance optimizations

### Phase 3: Advanced Features
1. Admin interface
2. Maps integration
3. Offline capabilities
4. Analytics and feedback