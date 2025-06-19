#!/bin/bash

# Base URLs
AUTH_URL="http://localhost:3000/api/auth"
USERS_URL="http://localhost:3000/api/users"
POSTS_URL="http://localhost:3000/api/posts"
FEED_URL="http://localhost:3000/api/feed"

# Global variable for JWT token
JWT_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to pretty print API responses
print_response() {
    local response=$1
    echo "Response:"
    # Check if python is available to prettify and if response looks like json
    if command -v python &> /dev/null && [ -n "$response" ] && [[ "$response" == "{"* || "$response" == "["* ]]; then
        echo -e "${CYAN}"
        echo "$response" | python -m json.tool
        echo -e "${NC}"
    else
        # Fallback to raw, colored output
        echo -e "${CYAN}$response${NC}"
    fi
    echo ""
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    local auth_header_opts=()
    if [ -n "$JWT_TOKEN" ]; then
        auth_header_opts=("-H" "Authorization: Bearer $JWT_TOKEN")
    fi

    local response
    if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
        response=$(curl -s -X "$method" "${auth_header_opts[@]}" "$endpoint")
    else
        response=$(curl -s -X "$method" "${auth_header_opts[@]}" -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    
    print_response "$response"
}

# Function to get JWT token from user
get_jwt_token() {
    if [ -z "$JWT_TOKEN" ]; then
        read -p "Enter JWT Token: " JWT_TOKEN
    fi
}

# Auth-related functions
test_register_user() {
    print_header "Testing POST register user"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email
    read -p "Enter password: " password
    
    local user_data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email",
    "password": "$password"
}
EOF
)
    make_request "POST" "$AUTH_URL/register" "$user_data"
}

test_login_user() {
    print_header "Testing POST login user"
    read -p "Enter email: " email
    read -p "Enter password: " password
    
    local user_data=$(cat <<EOF
{
    "email": "$email",
    "password": "$password"
}
EOF
)
    # Make the request and store the response
    local response=$(curl -s -X POST "$AUTH_URL/login" -H "Content-Type: application/json" -d "$user_data")
    
    print_response "$response"

    # Manually parse the JWT token from the JSON response without jq
    local token=$(echo "$response" | sed -n 's/.*"jwt_token":"\([^"]*\)".*/\1/p')

    if [ -n "$token" ] && [ "$token" != "null" ]; then
        JWT_TOKEN=$token
        echo -e "${GREEN}Login successful.${NC}"
        echo -e "${GREEN}JWT Token: $JWT_TOKEN${NC}"
        echo -e "${GREEN}This token is now stored for all subsequent requests in this session.${NC}"
    else
        echo -e "${RED}Login failed or no JWT token was returned.${NC}"
        JWT_TOKEN=""
    fi
}

test_delete_auth_user() {
    print_header "Testing DELETE user from auth"
    get_jwt_token
    make_request "DELETE" "$AUTH_URL/"
}

# User-related functions
test_get_all_users() {
    print_header "Testing GET all users"
    make_request "GET" "$USERS_URL"
}

test_get_user_by_id() {
    print_header "Testing GET user by ID"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id"
}

test_follow_user() {
    print_header "Testing POST follow user"
    get_jwt_token
    read -p "Enter user ID to follow: " user_id
    make_request "POST" "$USERS_URL/follow/$user_id"
}

test_unfollow_user() {
    print_header "Testing POST unfollow user"
    get_jwt_token
    read -p "Enter user ID to unfollow: " user_id
    make_request "POST" "$USERS_URL/unfollow/$user_id"
}

test_get_followers() {
    print_header "Testing GET user's followers"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id/followers"
}

test_get_following() {
    print_header "Testing GET user's following"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id/following"
}

test_get_user_activity() {
    print_header "Testing GET user activity"
    read -p "Enter user ID: " user_id
    read -p "Enter type (post, like, follow, all) [all]: " type
    read -p "Enter start date (YYYY-MM-DD) [optional]: " startDate
    read -p "Enter end date (YYYY-MM-DD) [optional]: " endDate
    read -p "Enter sort (asc, desc) [desc]: " sort
    read -p "Enter limit [10]: " limit
    read -p "Enter offset [0]: " offset
    
    local query_params="?"
    if [ -n "$type" ]; then query_params+="type=$type&"; fi
    if [ -n "$startDate" ]; then query_params+="startDate=$startDate&"; fi
    if [ -n "$endDate" ]; then query_params+="endDate=$endDate&"; fi
    if [ -n "$sort" ]; then query_params+="sort=$sort&"; fi
    if [ -n "$limit" ]; then query_params+="limit=$limit&"; fi
    if [ -n "$offset" ]; then query_params+="offset=$offset&"; fi
    
    make_request "GET" "$USERS_URL/$user_id/activity$query_params"
}


# Post-related functions
test_get_all_posts() {
    print_header "Testing GET all posts"
    read -p "Enter limit [10]: " limit
    read -p "Enter offset [0]: " offset

    local query_params="?"
    if [ -n "$limit" ]; then query_params+="limit=$limit&"; fi
    if [ -n "$offset" ]; then query_params+="offset=$offset&"; fi
    
    make_request "GET" "$POSTS_URL/$query_params"
}

test_create_post() {
    print_header "Testing POST create post"
    get_jwt_token
    read -p "Enter post content: " content
    read -p "Enter hashtags (comma-separated): " hashtags
    
    local hashtags_json="["
    if [ -n "$hashtags" ]; then
        IFS=',' read -ra ADDR <<< "$hashtags"
        for i in "${ADDR[@]}"; do
            hashtags_json+="\"$i\","
        done
        hashtags_json=${hashtags_json%?} # remove last comma
    fi
    hashtags_json+="]"
    
    local post_data=$(cat <<EOF
{
    "content": "$content",
    "hashtags": $hashtags_json
}
EOF
)
    make_request "POST" "$POSTS_URL" "$post_data"
}

test_update_post() {
    print_header "Testing PUT update post"
    get_jwt_token
    read -p "Enter post ID to update: " post_id
    read -p "Enter new content: " content
    read -p "Enter new hashtags (comma-separated): " hashtags
    
    local hashtags_json="["
    if [ -n "$hashtags" ]; then
        IFS=',' read -ra ADDR <<< "$hashtags"
        for i in "${ADDR[@]}"; do
            hashtags_json+="\"$i\","
        done
        hashtags_json=${hashtags_json%?} # remove last comma
    fi
    hashtags_json+="]"

    local update_data=$(cat <<EOF
{
    "content": "$content",
    "hashtags": $hashtags_json
}
EOF
)
    make_request "PUT" "$POSTS_URL/$post_id" "$update_data"
}

test_delete_post() {
    print_header "Testing DELETE post"
    get_jwt_token
    read -p "Enter post ID to delete: " post_id
    make_request "DELETE" "$POSTS_URL/$post_id"
}

test_get_post_by_id() {
    print_header "Testing GET post by ID"
    read -p "Enter post ID: " post_id
    make_request "GET" "$POSTS_URL/search/$post_id"
}

test_get_posts_by_hashtag() {
    print_header "Testing GET posts by hashtag"
    read -p "Enter hashtag: " hashtag
    make_request "GET" "$POSTS_URL/hashtag/$hashtag"
}

test_like_post() {
    print_header "Testing POST like post"
    get_jwt_token
    read -p "Enter post ID to like: " post_id
    make_request "POST" "$POSTS_URL/like/$post_id"
}

test_unlike_post() {
    print_header "Testing POST unlike post"
    get_jwt_token
    read -p "Enter post ID to unlike: " post_id
    make_request "POST" "$POSTS_URL/unlike/$post_id"
}


# Feed-related functions
test_get_user_feed() {
    print_header "Testing GET user feed"
    get_jwt_token
    read -p "Enter user ID for the feed: " user_id
    read -p "Enter limit [10]: " limit
    read -p "Enter offset [0]: " offset

    local query_params="?"
    if [ -n "$limit" ]; then query_params+="limit=$limit&"; fi
    if [ -n "$offset" ]; then query_params+="offset=$offset&"; fi

    make_request "GET" "$FEED_URL/$user_id$query_params"
}

# Submenu functions
show_auth_menu() {
    echo -e "\n${GREEN}Auth Menu${NC}"
    echo "1. Register User"
    echo "2. Login User"
    echo "3. Delete Your Account"
    echo "4. Back to main menu"
    echo -n "Enter your choice (1-4): "
}

show_users_menu() {
    echo -e "\n${GREEN}Users Menu${NC}"
    echo "1. Get all users"
    echo "2. Get user by ID"
    echo "3. Follow user"
    echo "4. Unfollow user"
    echo "5. Get followers"
    echo "6. Get following"
    echo "7. Get user activity"
    echo "8. Back to main menu"
    echo -n "Enter your choice (1-8): "
}

show_posts_menu() {
    echo -e "\n${GREEN}Posts Menu${NC}"
    echo "1. Get all posts"
    echo "2. Create new post"
    echo "3. Update post"
    echo "4. Delete post"
    echo "5. Get post by ID"
    echo "6. Get posts by hashtag"
    echo "7. Like post"
    echo "8. Unlike post"
    echo "9. Back to main menu"
    echo -n "Enter your choice (1-9): "
}

show_feed_menu() {
    echo -e "\n${GREEN}Feed Menu${NC}"
    echo "1. Get user feed"
    echo "2. Back to main menu"
    echo -n "Enter your choice (1-2): "
}


# Main menu
show_main_menu() {
    echo -e "\n${GREEN}API Testing Menu${NC}"
    echo "1. Auth"
    echo "2. Users"
    echo "3. Posts"
    echo "4. Feed"
    echo "5. Exit"
    echo -n "Enter your choice (1-5): "
}

# Main loop
while true; do
    show_main_menu
    read choice
    case $choice in
        1)
            while true; do
                show_auth_menu
                read auth_choice
                case $auth_choice in
                    1) test_register_user ;;
                    2) test_login_user ;;
                    3) test_delete_auth_user ;;
                    4) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        2)
            while true; do
                show_users_menu
                read user_choice
                case $user_choice in
                    1) test_get_all_users ;;
                    2) test_get_user_by_id ;;
                    3) test_follow_user ;;
                    4) test_unfollow_user ;;
                    5) test_get_followers ;;
                    6) test_get_following ;;
                    7) test_get_user_activity ;;
                    8) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        3)
            while true; do
                show_posts_menu
                read post_choice
                case $post_choice in
                    1) test_get_all_posts ;;
                    2) test_create_post ;;
                    3) test_update_post ;;
                    4) test_delete_post ;;
                    5) test_get_post_by_id ;;
                    6) test_get_posts_by_hashtag ;;
                    7) test_like_post ;;
                    8) test_unlike_post ;;
                    9) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        4)
            while true; do
                show_feed_menu
                read feed_choice
                case $feed_choice in
                    1) test_get_user_feed ;;
                    2) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        5) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice. Please try again." ;;
    esac
done
