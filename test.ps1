# API Testing Script for Backend Intern Assignment
# PowerShell version for Windows

$baseUrl = "http://localhost:3000"
$jwtToken = ""

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Make-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Data = @{},
        [string]$Description
    )
    
    Write-ColorText "`n=== $Description ===" "Yellow"
    Write-ColorText "URL: $Method $baseUrl$Endpoint" "Cyan"
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($jwtToken -ne "") {
            $headers["Authorization"] = "Bearer $jwtToken"
        }
        
        if ($Data.Count -gt 0) {
            Write-ColorText "Data: $(ConvertTo-Json $Data)" "Cyan"
        }
        
        $response = if ($Data.Count -gt 0) {
            Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body (ConvertTo-Json $Data) -ContentType "application/json"
        }
        else {
            Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers
        }
        
        Write-ColorText "Response: $(ConvertTo-Json $response -Depth 5)" "Green"
        return $response
    }
    catch {
        Write-ColorText "Error: $($_.Exception.Message)" "Red"
        if ($_.Exception.Response) {
            Write-ColorText "Status: $($_.Exception.Response.StatusCode)" "Red"
        }
        return $null
    }
}

function Show-Menu {
    param([string]$Title, [array]$Options)
    
    Write-ColorText "`n=== $Title ===" "Magenta"
    for ($i = 0; $i -lt $Options.Count; $i++) {
        Write-Host "$($i + 1). $($Options[$i])"
    }
    Write-Host "0. Back to main menu"
}

function Test-Auth {
    do {
        Show-Menu "Authentication Tests" @(
            "Register User",
            "Login User",
            "Get Profile"
        )
        
        $choice = Read-Host "Choose an option"
        
        switch ($choice) {
            "1" {
                $userData = @{
                    username    = "testuser_$(Get-Random)"
                    email       = "test$(Get-Random)@example.com"
                    password    = "password123"
                    displayName = "Test User"
                    bio         = "Test bio"
                }
                Make-ApiCall "POST" "/auth/register" $userData "Register User"
            }
            "2" {
                $loginData = @{
                    email    = Read-Host "Enter email"
                    password = Read-Host "Enter password"
                }
                $response = Make-ApiCall "POST" "/auth/login" $loginData "Login User"
                if ($response -and $response.token) {
                    $global:jwtToken = $response.token
                    Write-ColorText "JWT Token saved for subsequent requests!" "Green"
                }
            }
            "3" {
                Make-ApiCall "GET" "/auth/profile" @{} "Get Profile"
            }
        }
    } while ($choice -ne "0")
}

function Test-Users {
    do {
        Show-Menu "User Tests" @(
            "Get All Users",
            "Get User by ID",
            "Update User",
            "Follow User",
            "Unfollow User",
            "Get Following",
            "Get Followers",
            "Get User Activity"
        )
        
        $choice = Read-Host "Choose an option"
        
        switch ($choice) {
            "1" { Make-ApiCall "GET" "/users" @{} "Get All Users" }
            "2" {
                $userId = Read-Host "Enter user ID"
                Make-ApiCall "GET" "/users/$userId" @{} "Get User by ID"
            }
            "3" {
                $updateData = @{
                    displayName = "Updated Name"
                    bio         = "Updated bio"
                }
                Make-ApiCall "PUT" "/users/profile" $updateData "Update User Profile"
            }
            "4" {
                $userId = Read-Host "Enter user ID to follow"
                Make-ApiCall "POST" "/users/$userId/follow" @{} "Follow User"
            }
            "5" {
                $userId = Read-Host "Enter user ID to unfollow"
                Make-ApiCall "DELETE" "/users/$userId/follow" @{} "Unfollow User"
            }
            "6" { Make-ApiCall "GET" "/users/following" @{} "Get Following" }
            "7" { Make-ApiCall "GET" "/users/followers" @{} "Get Followers" }
            "8" {
                $params = "?limit=10"
                Make-ApiCall "GET" "/users/activity$params" @{} "Get User Activity"
            }
        }
    } while ($choice -ne "0")
}

function Test-Posts {
    do {
        Show-Menu "Post Tests" @(
            "Create Post",
            "Get All Posts",
            "Get Post by ID",
            "Update Post",
            "Delete Post",
            "Like Post",
            "Unlike Post"
        )
        
        $choice = Read-Host "Choose an option"
        
        switch ($choice) {
            "1" {
                $postData = @{
                    content  = "This is a test post #testing #api"
                    hashtags = @("#testing", "#api")
                }
                Make-ApiCall "POST" "/posts" $postData "Create Post"
            }
            "2" { Make-ApiCall "GET" "/posts" @{} "Get All Posts" }
            "3" {
                $postId = Read-Host "Enter post ID"
                Make-ApiCall "GET" "/posts/$postId" @{} "Get Post by ID"
            }
            "4" {
                $postId = Read-Host "Enter post ID to update"
                $updateData = @{
                    content  = "Updated post content #updated"
                    hashtags = @("#updated")
                }
                Make-ApiCall "PUT" "/posts/$postId" $updateData "Update Post"
            }
            "5" {
                $postId = Read-Host "Enter post ID to delete"
                Make-ApiCall "DELETE" "/posts/$postId" @{} "Delete Post"
            }
            "6" {
                $postId = Read-Host "Enter post ID to like"
                Make-ApiCall "POST" "/posts/$postId/like" @{} "Like Post"
            }
            "7" {
                $postId = Read-Host "Enter post ID to unlike"
                Make-ApiCall "DELETE" "/posts/$postId/like" @{} "Unlike Post"
            }
        }
    } while ($choice -ne "0")
}

function Test-Feed {
    do {
        Show-Menu "Feed Tests" @(
            "Get Feed",
            "Get Trending Hashtags"
        )
        
        $choice = Read-Host "Choose an option"
        
        switch ($choice) {
            "1" {
                $params = "?page=1&limit=10"
                Make-ApiCall "GET" "/feed$params" @{} "Get Feed"
            }
            "2" { Make-ApiCall "GET" "/feed/trending" @{} "Get Trending Hashtags" }
        }
    } while ($choice -ne "0")
}

# Main execution
Write-ColorText "Backend Intern Assignment API Tester" "Cyan"
Write-ColorText "Make sure your server is running on $baseUrl" "Yellow"

do {
    Show-Menu "Main Menu" @(
        "Authentication Tests",
        "User Tests", 
        "Post Tests",
        "Feed Tests"
    )
    
    $choice = Read-Host "Choose an option"
    
    switch ($choice) {
        "1" { Test-Auth }
        "2" { Test-Users }
        "3" { Test-Posts }
        "4" { Test-Feed }
        "0" { 
            Write-ColorText "Goodbye!" "Green"
            exit 
        }
        default { Write-ColorText "Invalid option!" "Red" }
    }
} while ($true) 