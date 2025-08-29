#!/usr/bin/env python3
"""
DAW Backend API Test Suite
Tests all DAW functionality including projects, tracks, and audio management
"""

import requests
import json
import base64
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://praise-tracks-1.preview.emergentagent.com/api"
TIMEOUT = 30

class DAWAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.test_project_id = None
        self.test_track_id = None
        
    def log(self, message):
        """Log test messages with timestamp"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_api_connectivity(self):
        """Test 1: Basic API connectivity"""
        self.log("Testing basic API connectivity...")
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "DAW API Ready" in data.get("message", ""):
                    self.log("✅ API connectivity test PASSED")
                    return True
                else:
                    self.log(f"❌ API connectivity test FAILED - Unexpected response: {data}")
                    return False
            else:
                self.log(f"❌ API connectivity test FAILED - Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ API connectivity test FAILED - Error: {str(e)}")
            return False
    
    def test_create_project(self):
        """Test 2: Create a new DAW project"""
        self.log("Testing project creation...")
        try:
            project_data = {
                "name": "My First Project",
                "tempo": 120
            }
            
            response = self.session.post(
                f"{self.base_url}/projects",
                json=project_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == "My First Project" and data.get("tempo") == 120:
                    self.test_project_id = data.get("id")
                    self.log(f"✅ Project creation test PASSED - Project ID: {self.test_project_id}")
                    return True
                else:
                    self.log(f"❌ Project creation test FAILED - Invalid data: {data}")
                    return False
            else:
                self.log(f"❌ Project creation test FAILED - Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Project creation test FAILED - Error: {str(e)}")
            return False
    
    def test_get_all_projects(self):
        """Test 3: Get all projects"""
        self.log("Testing get all projects...")
        try:
            response = self.session.get(f"{self.base_url}/projects")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if our test project is in the list
                    project_found = any(p.get("id") == self.test_project_id for p in data)
                    if project_found:
                        self.log(f"✅ Get all projects test PASSED - Found {len(data)} projects")
                        return True
                    else:
                        self.log(f"❌ Get all projects test FAILED - Test project not found in list")
                        return False
                else:
                    self.log(f"❌ Get all projects test FAILED - Invalid response format: {data}")
                    return False
            else:
                self.log(f"❌ Get all projects test FAILED - Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Get all projects test FAILED - Error: {str(e)}")
            return False
    
    def test_get_project_by_id(self):
        """Test 4: Get specific project by ID"""
        self.log("Testing get project by ID...")
        try:
            if not self.test_project_id:
                self.log("❌ Get project by ID test FAILED - No test project ID available")
                return False
                
            response = self.session.get(f"{self.base_url}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.test_project_id and data.get("name") == "My First Project":
                    self.log("✅ Get project by ID test PASSED")
                    return True
                else:
                    self.log(f"❌ Get project by ID test FAILED - Invalid data: {data}")
                    return False
            else:
                self.log(f"❌ Get project by ID test FAILED - Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Get project by ID test FAILED - Error: {str(e)}")
            return False
    
    def test_add_audio_track(self):
        """Test 5: Add audio track to project"""
        self.log("Testing add audio track...")
        try:
            if not self.test_project_id:
                self.log("❌ Add audio track test FAILED - No test project ID available")
                return False
            
            # Create sample base64 audio data (simulated)
            sample_audio = base64.b64encode(b"sample_audio_data_for_testing").decode('utf-8')
            
            track_data = {
                "name": "Lead Vocal",
                "audio_data": sample_audio,
                "duration": 180.5
            }
            
            response = self.session.post(
                f"{self.base_url}/projects/{self.test_project_id}/tracks",
                json=track_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("name") == "Lead Vocal" and 
                    data.get("duration") == 180.5 and 
                    data.get("audio_data") == sample_audio):
                    self.test_track_id = data.get("id")
                    self.log(f"✅ Add audio track test PASSED - Track ID: {self.test_track_id}")
                    return True
                else:
                    self.log(f"❌ Add audio track test FAILED - Invalid data: {data}")
                    return False
            else:
                self.log(f"❌ Add audio track test FAILED - Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log(f"❌ Add audio track test FAILED - Error: {str(e)}")
            return False
    
    def test_update_track_properties(self):
        """Test 6: Update track properties (volume, mute, solo)"""
        self.log("Testing update track properties...")
        try:
            if not self.test_project_id or not self.test_track_id:
                self.log("❌ Update track properties test FAILED - Missing project or track ID")
                return False
            
            update_data = {
                "volume": 0.8,
                "pan": -0.2,
                "muted": True,
                "solo": False
            }
            
            response = self.session.put(
                f"{self.base_url}/projects/{self.test_project_id}/tracks/{self.test_track_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("volume") == 0.8 and 
                    data.get("pan") == -0.2 and 
                    data.get("muted") == True and 
                    data.get("solo") == False):
                    self.log("✅ Update track properties test PASSED")
                    return True
                else:
                    self.log(f"❌ Update track properties test FAILED - Properties not updated correctly: {data}")
                    return False
            else:
                self.log(f"❌ Update track properties test FAILED - Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Update track properties test FAILED - Error: {str(e)}")
            return False
    
    def test_delete_track(self):
        """Test 7: Delete a track"""
        self.log("Testing delete track...")
        try:
            if not self.test_project_id or not self.test_track_id:
                self.log("❌ Delete track test FAILED - Missing project or track ID")
                return False
            
            response = self.session.delete(
                f"{self.base_url}/projects/{self.test_project_id}/tracks/{self.test_track_id}"
            )
            
            if response.status_code == 200:
                data = response.json()
                if "Track deleted successfully" in data.get("message", ""):
                    self.log("✅ Delete track test PASSED")
                    return True
                else:
                    self.log(f"❌ Delete track test FAILED - Unexpected response: {data}")
                    return False
            else:
                self.log(f"❌ Delete track test FAILED - Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Delete track test FAILED - Error: {str(e)}")
            return False
    
    def test_delete_project(self):
        """Test 8: Delete the entire project"""
        self.log("Testing delete project...")
        try:
            if not self.test_project_id:
                self.log("❌ Delete project test FAILED - No test project ID available")
                return False
            
            response = self.session.delete(f"{self.base_url}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "Project deleted successfully" in data.get("message", ""):
                    self.log("✅ Delete project test PASSED")
                    return True
                else:
                    self.log(f"❌ Delete project test FAILED - Unexpected response: {data}")
                    return False
            else:
                self.log(f"❌ Delete project test FAILED - Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Delete project test FAILED - Error: {str(e)}")
            return False
    
    def test_verify_project_deleted(self):
        """Test 9: Verify project was actually deleted"""
        self.log("Testing verify project deletion...")
        try:
            if not self.test_project_id:
                self.log("❌ Verify project deletion test FAILED - No test project ID available")
                return False
            
            response = self.session.get(f"{self.base_url}/projects/{self.test_project_id}")
            
            if response.status_code == 404:
                self.log("✅ Verify project deletion test PASSED - Project not found (as expected)")
                return True
            else:
                self.log(f"❌ Verify project deletion test FAILED - Project still exists, Status: {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Verify project deletion test FAILED - Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all DAW API tests"""
        self.log("=" * 60)
        self.log("Starting DAW Backend API Test Suite")
        self.log("=" * 60)
        
        tests = [
            ("API Connectivity", self.test_api_connectivity),
            ("Create Project", self.test_create_project),
            ("Get All Projects", self.test_get_all_projects),
            ("Get Project by ID", self.test_get_project_by_id),
            ("Add Audio Track", self.test_add_audio_track),
            ("Update Track Properties", self.test_update_track_properties),
            ("Delete Track", self.test_delete_track),
            ("Delete Project", self.test_delete_project),
            ("Verify Project Deleted", self.test_verify_project_deleted)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running: {test_name} ---")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log(f"❌ {test_name} FAILED with exception: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(0.5)
        
        self.log("\n" + "=" * 60)
        self.log("DAW Backend API Test Results")
        self.log("=" * 60)
        self.log(f"✅ Tests Passed: {passed}")
        self.log(f"❌ Tests Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return passed, failed

if __name__ == "__main__":
    tester = DAWAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)