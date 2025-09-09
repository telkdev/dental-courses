# Dental Courses Landing Page

A modern and interactive landing page for dental courses with smooth scrolling animations powered by Lenis and GSAP.

## Features

- **Hero Section**: Introduces the dental courses with a striking image
- **Course Slider**: Interactive horizontal scroll animation displaying featured courses
- **FAQ Section**: Animated FAQ items that appear as you scroll down the page

## Technologies Used

- HTML5 & CSS3
- JavaScript (ES6+)
- [Lenis](https://github.com/studio-freight/lenis) for smooth scrolling
- [GSAP](https://greensock.com/gsap/) & ScrollTrigger for animations
- [Vite](https://vitejs.dev/) for development and building

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
```
git clone <repository-url>
cd dental-courses
```

2. Install dependencies
```
npm install
```

### Development

Run the development server:
```
npm start
```

### Building for Production

Create a production build:
```
npm run build
```

Preview the production build:
```
npm run preview
```

## Project Structure

```
dental-courses/
├── index.html               # Main HTML file
├── package.json             # Project configuration and dependencies
├── src/
│   ├── css/
│   │   └── styles.css       # Stylesheet
│   ├── js/
│   │   └── main.js          # Main JavaScript with animations
│   └── images/              # Image assets
└── dist/                    # Generated production build (after running build)
```

## Animation Details

- **Smooth Scrolling**: Implemented using Lenis for a premium feel
- **Course Slider**: Horizontal scrolling animation controlled by page scroll
- **FAQ Items**: Appear with a stagger effect as they enter the viewport

## License

This project is licensed under the ISC License.
