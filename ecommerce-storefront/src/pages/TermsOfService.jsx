import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import './LegalPage.css';

function TermsOfService() {
  return (
    <div className="legal-page">
      <PageMeta
        title="Terms of Service"
        description="Terms and conditions for using our online store."
        path="/terms"
      />
      <div className="container">
        <article className="legal-content">
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: June 2026</p>

          <p>
            By accessing and using this website, you agree to these terms. Please read them carefully
            before placing an order.
          </p>

          <h2>Orders and payment</h2>
          <p>
            All orders are subject to product availability. We currently accept cash on delivery (COD).
            Prices are displayed in USD or LBP as indicated on each product. We reserve the right to
            cancel orders in case of pricing errors or stock issues.
          </p>

          <h2>Shipping and delivery</h2>
          <p>
            Delivery times and shipping fees vary by product and location. You are responsible for
            providing an accurate delivery address and phone number. We are not liable for delays
            caused by circumstances beyond our control.
          </p>

          <h2>Returns and refunds</h2>
          <p>
            If you receive a damaged or incorrect item, contact us within 48 hours of delivery.
            We will work with you to resolve the issue through replacement or refund, subject to inspection.
          </p>

          <h2>Account responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activity under your account.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, we are not liable for indirect or consequential
            damages arising from use of our website or products.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            constitutes acceptance of the updated terms.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Visit our <Link to="/contact">contact page</Link>.
          </p>
        </article>
      </div>
    </div>
  );
}

export default TermsOfService;
