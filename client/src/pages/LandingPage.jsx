/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useEffect } from 'react';

const LandingPage = () => {
  useEffect(() => {
    // Initialize FAQ functionality after component mounts
    const initFAQ = () => {
      const faqQuestions = document.querySelectorAll('.faq-question');
      if (faqQuestions.length === 0) return; // FAQ elements not yet rendered

      faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
          const faqItem = question.parentElement;
          const isActive = faqItem.classList.contains('active');

          // Close all FAQ items
          document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
          });

          // Toggle current FAQ item
          if (!isActive) {
            faqItem.classList.add('active');
          }
        });
      });
    };

    // Wait for the next tick to ensure DOM is updated
    const timeoutId = setTimeout(initFAQ, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIVA - Advanced AI Assistant</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container nav-container">
            <a href="#" class="logo">
                <img src="/assets/Icon.ico" alt="AIVA Logo">
                <span>AIVA</span>
            </a>
            <div class="nav-links">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
            </div>
            <div class="nav-buttons">
                <a href="/log-in" class="btn btn-primary">Sign In</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <canvas id="hero-canvas"></canvas>
        <div class="hero-content">
            <div class="hero-text-container">
                <h1 class="hero-title">
                    <span class="gradient-text">AIVA</span>
                    <span class="subtitle">Innovative Tech Solutions</span>
                </h1>
                <p class="hero-subtitle">Empowering developers with cutting-edge AI and web technologies</p>
                <div class="hero-features">
                    <div class="feature-tag">
                        <i class="fas fa-robot"></i>
                        <span>AI Assistant</span>
                    </div>
                    <div class="feature-tag">
                        <i class="fas fa-globe"></i>
                        <span>Web Platform</span>
                    </div>
                    <div class="feature-tag">
                        <i class="fas fa-bolt"></i>
                        <span>Lightning Fast</span>
                    </div>
                </div>
                <div class="hero-buttons">
                    <a href="#features" class="btn btn-primary">
                        <i class="fas fa-info-circle"></i>
                        Learn More
                    </a>
                    <a href="/log-in" class="btn btn-secondary">
                        <i class="fas fa-sign-in-alt"></i>
                        Get Started
                    </a>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-gif-container">
                    <img src="/assets/AIVA.gif" alt="AIVA Demo" class="hero-gif">
                    <div class="floating-elements">
                        <div class="floating-element element-1">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="floating-element element-2">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="floating-element element-3">
                            <i class="fas fa-microchip"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="hero-scroll-indicator">
            <div class="scroll-text">Scroll to explore</div>
            <div class="scroll-arrow"></div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
        <div class="container">
            <h2>Powerful Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3>Advanced AI</h3>
                    <p>Powered by cutting-edge artificial intelligence for natural conversations and intelligent responses</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <h3>Code Assistant</h3>
                    <p>Expert help with coding, debugging, and development tasks across multiple programming languages</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-language"></i>
                    </div>
                    <h3>Multi-language Support</h3>
                    <p>Communicate in multiple natural languages and get assistance with various programming languages</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>Enterprise Security</h3>
                    <p>Enterprise-grade security and data protection for your peace of mind</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h3>Smart Interface</h3>
                    <p>Intuitive and modern interface designed for the best user experience</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-sync"></i>
                    </div>
                    <h3>Real-time Updates</h3>
                    <p>Stay up-to-date with the latest features and improvements</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
        <div class="container">
            <h2>How It Works</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <h3>Create Account</h3>
                    <p>Sign up for a free account and set up your personal workspace</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h3>Organize Tasks</h3>
                    <p>Create projects, add tasks, and manage your workflow efficiently</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>Collaborate</h3>
                    <p>Invite team members and collaborate on projects in real-time</p>
                </div>
            </div>
        </div>
    </section>

<!-- Features Section -->
<section id="features" class="features">
    <div class="container">
        <div class="features-header">
            <h2>Powerful Features for Productivity</h2>
            <p class="section-description">Discover how AIVA combines smart automation, habit tracking, and team collaboration to boost your productivity</p>
        </div>

        <div class="mern-stack">
            <!-- Habit Tracking -->
            <div class="tech-card habit">
                <div class="tech-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="tech-content">
                    <h3>Habit Tracking</h3>
                    <p>Build and maintain positive habits with smart reminders and progress tracking</p>
                    <div class="tech-features">
                        <span class="tech-tag">Daily Goals</span>
                        <span class="tech-tag">Progress Analytics</span>
                        <span class="tech-tag">Smart Reminders</span>
                    </div>
                </div>
            </div>

            <!-- AI Assistant -->
            <div class="tech-card ai">
                <div class="tech-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="tech-content">
                    <h3>AI Assistant</h3>
                    <p>Intelligent chatbot that helps automate tasks and provides smart suggestions</p>
                    <div class="tech-features">
                        <span class="tech-tag">Task Automation</span>
                        <span class="tech-tag">Smart Suggestions</span>
                        <span class="tech-tag">24/7 Support</span>
                    </div>
                </div>
            </div>

            <!-- Team Collaboration -->
            <div class="tech-card team">
                <div class="tech-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="tech-content">
                    <h3>Team Collaboration</h3>
                    <p>Work together seamlessly with real-time collaboration and communication tools</p>
                    <div class="tech-features">
                        <span class="tech-tag">Real-time Sync</span>
                        <span class="tech-tag">Shared Workspaces</span>
                        <span class="tech-tag">Instant Messaging</span>
                    </div>
                </div>
            </div>

            <!-- Smart Organization -->
            <div class="tech-card organize">
                <div class="tech-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="tech-content">
                    <h3>Smart Organization</h3>
                    <p>AI-powered organization that helps you stay productive and focused</p>
                    <div class="tech-features">
                        <span class="tech-tag">Priority Sorting</span>
                        <span class="tech-tag">Smart Search</span>
                        <span class="tech-tag">Auto-Categorization</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Key Features Grid -->
        <div class="key-features">
            <h3>Core Features</h3>
            <div class="features-grid-modern">
                <div class="feature-item">
                    <div class="feature-icon-modern">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <h4>Task Management</h4>
                    <p>Organize and track your tasks with advanced project management tools</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon-modern">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h4>Calendar Integration</h4>
                    <p>Schedule and manage deadlines with integrated calendar functionality</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon-modern">
                        <i class="fas fa-sticky-note"></i>
                    </div>
                    <h4>Notes & Documentation</h4>
                    <p>Create and organize notes with rich text editing capabilities</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon-modern">
                        <i class="fas fa-users"></i>
                    </div>
                    <h4>Team Collaboration</h4>
                    <p>Work together with team members in shared workspaces</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon-modern">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h4>Secure & Private</h4>
                    <p>Enterprise-grade security with encrypted data and user authentication</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon-modern">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h4>Responsive Design</h4>
                    <p>Access your workspace from any device with responsive design</p>
                </div>
            </div>
        </div>
    </div>
</section>

    <!-- Statistics Section -->
    <section class="statistics">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number" data-count="1000">0</div>
                    <div class="stat-label">Active Users</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" data-count="50000">0</div>
                    <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" data-count="250">0</div>
                    <div class="stat-label">Team Workspaces</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" data-count="98">0</div>
                    <div class="stat-label">User Satisfaction</div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq">
        <div class="container">
            <h2>Frequently Asked Questions</h2>
            <div class="faq-grid">
                <div class="faq-item">
                    <div class="faq-question">
                        <h3>What is AIVA?</h3>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>AIVA is a modern web application built with the MERN stack (MongoDB, Express.js, React, Node.js) designed for task management, team collaboration, and productivity enhancement.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">
                        <h3>Is AIVA free to use?</h3>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Yes! AIVA offers a free tier with essential features. Premium plans are available for teams and organizations requiring advanced features and priority support.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <div class="faq-question">
                        <h3>Is my data secure?</h3>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="faq-answer">
                        <p>Absolutely. We implement enterprise-grade security measures including data encryption, secure authentication, and regular security audits to protect your information.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="logo">
                        <img src="/assets/Icon.ico" alt="AIVA Logo">
                        <span>AIVA</span>
                    </div>
                    <p>Modern MERN stack web application for task management and team collaboration</p>
                    <div class="footer-tech-stack">
                        <span class="tech-badge">MongoDB</span>
                        <span class="tech-badge">Express.js</span>
                        <span class="tech-badge">React</span>
                        <span class="tech-badge">Node.js</span>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Platform</h4>
                    <ul>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#how-it-works">How It Works</a></li>
                        <li><a href="/log-in">Sign In</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="https://github.com/jadeja-mohitrajsinh/AIVA">GitHub</a></li>
                        <li><a href="#contact">Support</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="social-links">
                        <a href="#" class="social-link" title="GitHub"><i class="fab fa-github"></i></a>
                        <a href="#" class="social-link" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        <a href="#" class="social-link" title="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="social-link" title="Discord"><i class="fab fa-discord"></i></a>
                    </div>
                    <div class="newsletter-signup">
                        <p>Stay updated with our latest features</p>
                        <div class="newsletter-input">
                            <input type="email" placeholder="Enter your email" class="footer-email">
                            <button class="btn btn-primary btn-sm">Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <p>&copy; 2025 AIVA. All rights reserved.</p>
                    <div class="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
};

export default LandingPage;