

import React from 'react';
import { 
  Map, User, Trophy, Plus, Navigation, AlertTriangle, Heart, MessageCircle, 
  X, Check, Search, Radio, Car, Settings, Edit2, Trash2, Siren, Camera, Ban,
  Share2, Globe, UserPlus, UserMinus, Bell, Send
} from 'lucide-react';

export const Icons = {
  Map: (props: any) => <Map {...props} />,
  User: (props: any) => <User {...props} />,
  Trophy: (props: any) => <Trophy {...props} />,
  Plus: (props: any) => <Plus {...props} />,
  Nav: (props: any) => <Navigation {...props} />,
  Alert: (props: any) => <AlertTriangle {...props} />,
  Heart: (props: any) => <Heart {...props} />,
  Comment: (props: any) => <MessageCircle {...props} />,
  Close: (props: any) => <X {...props} />,
  Check: (props: any) => <Check {...props} />,
  Search: (props: any) => <Search {...props} />,
  Record: (props: any) => <Radio {...props} />,
  Car: (props: any) => <Car {...props} />,
  Settings: (props: any) => <Settings {...props} />,
  Edit: (props: any) => <Edit2 {...props} />,
  Trash: (props: any) => <Trash2 {...props} />,
  Siren: (props: any) => <Siren {...props} />,
  Camera: (props: any) => <Camera {...props} />,
  Pothole: (props: any) => <Ban {...props} />,
  Share: (props: any) => <Share2 {...props} />,
  Globe: (props: any) => <Globe {...props} />,
  UserPlus: (props: any) => <UserPlus {...props} />,
  UserMinus: (props: any) => <UserMinus {...props} />,
  Bell: (props: any) => <Bell {...props} />,
  Send: (props: any) => <Send {...props} />,
};