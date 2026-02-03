<?php
/**
 * JWT Auth Token Customization Filters
 *
 * Add these filters to your WordPress theme's functions.php
 * or create a custom plugin to customize JWT Auth behavior.
 *
 * Plugin: JWT Auth – WordPress JSON Web Token Authentication (v3.0+)
 * Author: Bagus
 *
 * IMPORTANT: These filters customize the JWT Auth plugin behavior.
 * Add to: wp-content/themes/your-theme/functions.php
 * Or create: wp-content/mu-plugins/jwt-auth-customization.php
 */

/**
 * Customize Access Token Expiration
 *
 * Default in v3.0+: 10 minutes (600 seconds)
 * Recommended: Keep short for security (10-30 minutes)
 *
 * @param int $expire Expiration time in seconds
 * @param int $issued_at Token issued timestamp
 * @return int Modified expiration time
 */
add_filter('jwt_auth_expire', function ($expire, $issued_at) {
    // Set to 15 minutes (900 seconds)
    // Shorter = more secure, but more refresh requests
    // Longer = fewer refreshes, but larger attack window if token is stolen
    return 900; // 15 minutes

    // Other common values:
    // return 600;   // 10 minutes (plugin default)
    // return 1800;  // 30 minutes
    // return 3600;  // 1 hour (not recommended for sensitive apps)
}, 10, 2);

/**
 * Customize Refresh Token Expiration
 *
 * Default: 30 days
 * This determines how long users can stay "logged in" without
 * re-entering credentials.
 *
 * @param int $expire Expiration time in seconds
 * @param int $issued_at Token issued timestamp
 * @return int Modified expiration time
 */
add_filter('jwt_auth_refresh_expire', function ($expire, $issued_at) {
    // Set to 7 days (604800 seconds)
    return 604800; // 7 days

    // Other common values:
    // return 86400;      // 1 day
    // return 604800;     // 7 days
    // return 1209600;    // 14 days
    // return 2592000;    // 30 days (plugin default)
}, 10, 2);

/**
 * Add Custom Data to JWT Token Payload
 *
 * This data will be encoded in the JWT and available client-side.
 * WARNING: Do NOT include sensitive data - JWTs are base64 encoded, not encrypted!
 *
 * @param array $data Token data
 * @param WP_User $user WordPress user object
 * @return array Modified token data
 */
add_filter('jwt_auth_token_before_sign', function ($data, $user) {
    // Add user roles to token (useful for client-side role checks)
    $data['roles'] = $user->roles;

    // Add custom user meta if needed
    // $data['custom_field'] = get_user_meta($user->ID, 'custom_field', true);

    return $data;
}, 10, 2);

/**
 * Customize the Login Response
 *
 * Add additional user data to the login response.
 * This is returned to the client after successful login.
 *
 * @param array $data Response data
 * @param WP_User $user WordPress user object
 * @return array Modified response data
 */
add_filter('jwt_auth_token_before_dispatch', function ($data, $user) {
    // The plugin already includes these in v3.0+:
    // - token (access token)
    // - refresh_token
    // - user_email
    // - user_nicename
    // - user_display_name

    // Add user ID (if not already present)
    $data['user_id'] = $user->ID;

    // Add user roles
    $data['roles'] = $user->roles;

    // Add ACF fields if using Advanced Custom Fields
    if (function_exists('get_fields')) {
        $acf_fields = get_fields('user_' . $user->ID);
        if ($acf_fields) {
            $data['acf'] = $acf_fields;
        }
    }

    // Add first and last name
    $data['firstName'] = $user->first_name;
    $data['lastName'] = $user->last_name;

    return $data;
}, 10, 2);

/**
 * Customize CORS Headers for JWT Auth Endpoints
 *
 * Important for SPA applications on different domains.
 *
 * @param bool $enable Whether CORS is enabled
 * @return bool
 */
add_filter('jwt_auth_cors_allow_headers', function ($headers) {
    // Add any custom headers your app needs
    return 'Access-Control-Allow-Headers, Content-Type, Authorization, X-Requested-With';
});

/**
 * Whitelist Additional REST Endpoints
 *
 * By default, JWT Auth protects all REST endpoints.
 * Use this filter to allow unauthenticated access to specific endpoints.
 *
 * @param array $endpoints Whitelisted endpoint patterns
 * @return array Modified whitelist
 */
add_filter('jwt_auth_whitelist', function ($endpoints) {
    // These endpoints don't require authentication
    $whitelist = array(
        // WordPress core public endpoints
        '/wp-json/wp/v2/posts',        // Public posts
        '/wp-json/wp/v2/pages',        // Public pages
        '/wp-json/wp/v2/categories',   // Categories
        '/wp-json/wp/v2/tags',         // Tags

        // Custom public endpoints
        // '/wp-json/custom/v1/public-data',
    );

    return array_merge($endpoints, $whitelist);
});

/**
 * Handle Refresh Token in Response
 *
 * Note: JWT Auth v3.0+ automatically includes refresh_token in login response.
 * This filter can customize the refresh response if needed.
 *
 * @param array $data Refresh response data
 * @param WP_User $user WordPress user object
 * @return array Modified response data
 */
add_filter('jwt_auth_refresh_token_before_dispatch', function ($data, $user) {
    // Add any additional data to refresh response
    // Note: Keep this minimal - just the new tokens is usually sufficient

    return $data;
}, 10, 2);

/**
 * Security: Validate Token on Every Request (Optional)
 *
 * Enable this for additional security - validates token hasn't been
 * revoked by checking against a blacklist in the database.
 * Note: This adds a database query per request.
 *
 * @param bool $valid Whether token is valid
 * @param WP_User $user User object
 * @param string $token The JWT token
 * @return bool
 */
// add_filter('jwt_auth_validate_token', function ($valid, $user, $token) {
//     if (!$valid) return false;
//
//     // Example: Check against a token blacklist
//     $blacklist = get_option('jwt_token_blacklist', array());
//     $token_id = hash('sha256', $token);
//
//     if (in_array($token_id, $blacklist)) {
//         return false;
//     }
//
//     return $valid;
// }, 10, 3);

/**
 * Logging: Track Token Usage (Optional - for debugging)
 *
 * Uncomment to log authentication attempts.
 * Useful for debugging but should be disabled in production.
 */
// add_action('jwt_auth_valid_token', function ($data, $user) {
//     error_log(sprintf(
//         'JWT Auth: Valid token for user %d (%s)',
//         $user->ID,
//         $user->user_email
//     ));
// }, 10, 2);

// add_action('jwt_auth_invalid_token', function () {
//     error_log('JWT Auth: Invalid token attempt');
// });
