export const SAMPLE_TEMPLATES = {
  html: {
    welcome: {
      name: 'Welcome Email',
      description: 'Welcome new subscribers to your platform',
      content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden; }
        .header { background: #4f46e5; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: white; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{company_name}}!</h1>
        </div>
        <div class="content">
            <h2>Hi {{first_name}},</h2>
            <p>Thank you for joining {{company_name}}! We're excited to have you on board.</p>
            <p>Here's what you can expect next:</p>
            <ul>
                <li>Access to our premium features</li>
                <li>Regular updates and tips</li>
                <li>24/7 customer support</li>
            </ul>
            <a href="{{dashboard_url}}" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The {{company_name}} Team</p>
        </div>
        <div class="footer">
            <p>© {{current_year}} {{company_name}}. All rights reserved.</p>
            <p>{{company_address}}</p>
        </div>
    </div>
</body>
</html>`
    },
    followUp: {
      name: 'Follow-up Email',
      description: 'Professional follow-up email template',
      content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Follow-up</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <p>Hi {{first_name}},</p>
        
        <p>I hope this email finds you well. I wanted to follow up on our recent conversation about {{topic}}.</p>
        
        <p>As discussed, I believe {{company_name}} can help {{prospect_company}} with:</p>
        <ul>
            <li>{{benefit_1}}</li>
            <li>{{benefit_2}}</li>
            <li>{{benefit_3}}</li>
        </ul>
        
        <p>Would you be available for a brief call next week to discuss this further? I'm confident we can provide significant value to your team.</p>
        
        <p>Please let me know what works best for your schedule.</p>
        
        <div class="signature">
            <p>Best regards,</p>
            <p><strong>{{sender_name}}</strong><br>
            {{sender_title}}<br>
            {{company_name}}<br>
            {{sender_phone}} | {{sender_email}}</p>
        </div>
    </div>
</body>
</html>`
    },
    newsletter: {
      name: 'Newsletter Template',
      description: 'Monthly newsletter HTML template',
      content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .section:last-child { border-bottom: none; }
        .highlight { background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .social-links { margin: 20px 0; }
        .social-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{company_name}} Newsletter</h1>
            <p>{{month}} {{year}} Edition</p>
        </div>
        <div class="content">
            <div class="section">
                <h2>Hi {{first_name}},</h2>
                <p>Welcome to our monthly newsletter! Here are the highlights from this month:</p>
            </div>
            
            <div class="section">
                <h2>🚀 Product Updates</h2>
                <ul>
                    <li><strong>New Feature</strong>: {{new_feature_name}} - {{new_feature_description}}</li>
                    <li><strong>Improvement</strong>: {{improvement_description}}</li>
                    <li><strong>Bug Fixes</strong>: Various performance improvements</li>
                </ul>
            </div>
            
            <div class="section">
                <h2>📊 Company News</h2>
                <p>{{company_news_content}}</p>
            </div>
            
            <div class="section">
                <h2>📚 Resources & Tips</h2>
                <div class="highlight">
                    <h3>{{tip_title}}</h3>
                    <p>{{tip_content}}</p>
                </div>
            </div>
            
            <div class="section">
                <h2>🎉 Community Highlights</h2>
                <p>{{community_highlights}}</p>
            </div>
            
            <div class="section">
                <h2>What's Coming Next Month?</h2>
                <p>{{next_month_preview}}</p>
            </div>
        </div>
        <div class="footer">
            <div class="social-links">
                <a href="{{twitter_url}}">Twitter</a> |
                <a href="{{community_url}}">Community</a> |
                <a href="{{blog_url}}">Blog</a>
            </div>
            <p>Thanks for being part of the {{company_name}} community!</p>
            <p><small>You can <a href="{{unsubscribe_url}}">unsubscribe</a> at any time.</small></p>
        </div>
    </div>
</body>
</html>`
    },
    outreach: {
      name: 'Cold Outreach',
      description: 'Professional cold outreach template',
      content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #ddd; border-radius: 8px; }
        .results { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .results ul { margin: 0; padding-left: 20px; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .ps { margin-top: 20px; font-style: italic; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <p>Hi {{first_name}},</p>
        
        <p>I hope you're having a great week!</p>
        
        <p>I've been following {{prospect_company}} and I'm impressed by {{specific_achievement}}.</p>
        
        <p>I'm reaching out because I believe we might be able to help {{prospect_company}} with {{specific_pain_point}}.</p>
        
        <h3>What we do:</h3>
        <p>{{company_name}} helps companies like yours {{main_value_proposition}}.</p>
        
        <div class="results">
            <h3>Quick wins we've achieved for similar companies:</h3>
            <ul>
                <li><strong>{{result_1}}</strong> for {{client_1}}</li>
                <li><strong>{{result_2}}</strong> for {{client_2}}</li>
                <li><strong>{{result_3}}</strong> for {{client_3}}</li>
            </ul>
        </div>
        
        <p>Would you be open to a brief 15-minute call to discuss how this might apply to {{prospect_company}}?</p>
        
        <p>I understand you're busy, so I'll keep it focused and valuable.</p>
        
        <div class="signature">
            <p>Best regards,</p>
            <p><strong>{{sender_name}}</strong><br>
            {{sender_title}} at {{company_name}}<br>
            {{sender_phone}} | {{sender_email}}</p>
        </div>
        
        <div class="ps">
            <p><strong>P.S.</strong> {{personal_note}}</p>
        </div>
    </div>
</body>
</html>`
    }
  }
};

export const TEMPLATE_VARIABLES = [
  // Personal
  '{{first_name}}',
  '{{last_name}}',
  '{{full_name}}',
  '{{email}}',
  
  // Company
  '{{company_name}}',
  '{{company_address}}',
  '{{prospect_company}}',
  
  // Sender
  '{{sender_name}}',
  '{{sender_title}}',
  '{{sender_email}}',
  '{{sender_phone}}',
  
  // URLs
  '{{website_url}}',
  '{{dashboard_url}}',
  '{{unsubscribe_url}}',
  '{{docs_url}}',
  '{{blog_url}}',
  '{{support_url}}',
  '{{twitter_url}}',
  '{{community_url}}',
  
  // Dates
  '{{current_date}}',
  '{{current_year}}',
  '{{month}}',
  
  // Custom
  '{{topic}}',
  '{{specific_achievement}}',
  '{{main_value_proposition}}',
  '{{personal_note}}'
];
