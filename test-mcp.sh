#!/bin/bash

# MCP Tools Test Script
# Run this after starting the worker to test MCP functionality

BASE_URL="http://localhost:8787"

echo "🧪 Testing MCP Tools Integration"
echo "================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: List available tools
echo -e "${BLUE}📋 Test 1: Listing available MCP tools${NC}"
echo "GET $BASE_URL/api/tools"
echo ""
curl -s "$BASE_URL/api/tools" | jq '.' || echo "❌ Failed to list tools"
echo ""
echo "-----------------------------------"
echo ""

# Test 2: Weather query
echo -e "${BLUE}🌤️  Test 2: Weather query (Beijing)${NC}"
echo "POST $BASE_URL/api/chat"
echo ""
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "北京现在天气怎么样？",
    "history": []
  }' | jq '.' || echo "❌ Weather query failed"
echo ""
echo "-----------------------------------"
echo ""

# Test 3: Math calculation
echo -e "${BLUE}🧮 Test 3: Math calculation${NC}"
echo "POST $BASE_URL/api/chat"
echo ""
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "帮我计算 123 * 456",
    "history": []
  }' | jq '.' || echo "❌ Calculation failed"
echo ""
echo "-----------------------------------"
echo ""

# Test 4: Time query
echo -e "${BLUE}⏰ Test 4: Time query${NC}"
echo "POST $BASE_URL/api/chat"
echo ""
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "现在纽约几点了？",
    "history": []
  }' | jq '.' || echo "❌ Time query failed"
echo ""
echo "-----------------------------------"
echo ""

# Test 5: Web search
echo -e "${BLUE}🔍 Test 5: Web search${NC}"
echo "POST $BASE_URL/api/chat"
echo ""
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "搜索一下 Cloudflare Workers 是什么",
    "history": []
  }' | jq '.' || echo "❌ Web search failed"
echo ""
echo "-----------------------------------"
echo ""

# Test 6: Multi-step reasoning
echo -e "${BLUE}🔗 Test 6: Multi-step reasoning (weather comparison)${NC}"
echo "POST $BASE_URL/api/chat"
echo ""
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "比较一下北京和上海现在的温度",
    "history": []
  }' | jq '.' || echo "❌ Multi-step reasoning failed"
echo ""
echo "-----------------------------------"
echo ""

echo -e "${GREEN}✅ Testing complete!${NC}"
echo ""
echo "💡 Tips:"
echo "  - Check if toolsUsed is true in responses"
echo "  - Look for tool execution logs in worker console"
echo "  - Try your own questions in the web UI"
