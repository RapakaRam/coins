#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Coin Collection App - Git Commit & Push${NC}\n"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${BLUE}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}\n"
fi

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo -e "${RED}⚠️  No remote repository configured${NC}"
    echo -e "${BLUE}Please add your GitHub repository:${NC}"
    echo "git remote add origin <your-github-repo-url>"
    echo ""
    read -p "Enter your GitHub repository URL (or press Enter to skip): " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo -e "${GREEN}✅ Remote repository added${NC}\n"
    else
        echo -e "${RED}Skipping remote configuration${NC}\n"
    fi
fi

# Get commit message
echo -e "${BLUE}Enter commit message (or press Enter for default):${NC}"
read COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Stage all changes
echo -e "${BLUE}📝 Staging changes...${NC}"
git add .

# Commit
echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Changes committed successfully${NC}\n"
    
    # Push to remote
    echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
    
    # Get current branch
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    
    # Try to push
    git push -u origin "$BRANCH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
        echo -e "${BLUE}🚀 If auto-deploy is configured, Render will deploy automatically${NC}"
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        echo -e "${BLUE}You may need to set up authentication or check your remote URL${NC}"
    fi
else
    echo -e "${RED}❌ No changes to commit${NC}"
fi

echo -e "\n${GREEN}Done!${NC}"
