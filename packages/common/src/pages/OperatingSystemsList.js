import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia,
  Button, Chip, Rating, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert,
  CircularProgress, Tabs, Tab, Paper, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Divider, Avatar, Badge
} from '@mui/material';
import {
  Star, StarBorder, Favorite, FavoriteBorder, Compare, Search,
  FilterList, Sort, Add, Edit, Delete, Visibility, ThumbUp, ThumbDown
} from '@mui/icons-material';
import { osPlatformAPI } from '../services/osPlatformAPI';

// ===========================================
// Operating Systems List Component
// ===========================================
function OperatingSystemsList() {
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedOS, setSelectedOS] = useState(null);
  const [comparisonDialog, setComparisonDialog] = useState(false);

  useEffect(() => {
    loadOperatingSystems();
  }, []);

  const loadOperatingSystems = async () => {
    try {
      setLoading(true);
      const data = await osPlatformAPI.getOperatingSystems();
      setOperatingSystems(data);
    } catch (err) {
      setError('Failed to load operating systems');
      logger.error('Error loading OS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToComparison = async (osId) => {
    try {
      await osPlatformAPI.addToComparison(osId);
      // Show success message or update UI
    } catch (err) {
      logger.error('Error adding to comparison:', err);
    }
  };

  const handleToggleFavorite = async (osId) => {
    try {
      await osPlatformAPI.toggleFavorite(osId);
      loadOperatingSystems(); // Refresh to update favorite status
    } catch (err) {
      logger.error('Error toggling favorite:', err);
    }
  };

  const filteredOS = operatingSystems.filter(os => {
    const matchesSearch = os.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         os.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || os.categories.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  const sortedOS = filteredOS.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
      case 'reviews':
        return (b.stats?.totalReviews || 0) - (a.stats?.totalReviews || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'release':
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={loadOperatingSystems}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Operating Systems Comparison
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Compare and review different operating systems
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search operating systems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="mobile">Mobile</MenuItem>
                <MenuItem value="server">Server</MenuItem>
                <MenuItem value="embedded">Embedded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="reviews">Reviews</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="release">Release Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<Compare />}
              onClick={() => setComparisonDialog(true)}
              fullWidth
            >
              Compare
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Operating Systems Grid */}
      <Grid container spacing={3}>
        {sortedOS.map((os) => (
          <Grid item xs={12} sm={6} md={4} key={os.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={os.images?.logo || '/api/placeholder/300/200'}
                alt={os.name}
                sx={{ objectFit: 'contain', p: 2 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2">
                    {os.name}
                  </Typography>
                  <IconButton
                    onClick={() => handleToggleFavorite(os.id)}
                    color={os.isFavorite ? 'error' : 'default'}
                  >
                    {os.isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {os.developer} • {os.version}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating
                    value={os.stats?.averageRating || 0}
                    precision={0.1}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({os.stats?.totalReviews || 0} reviews)
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {os.description?.substring(0, 100)}...
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {os.categories?.slice(0, 3).map((category) => (
                    <Chip key={category} label={category} size="small" />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Compare />}
                    onClick={() => handleAddToComparison(os.id)}
                  >
                    Compare
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => setSelectedOS(os)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* OS Details Dialog */}
      <Dialog
        open={!!selectedOS}
        onClose={() => setSelectedOS(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedOS && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">{selectedOS.name}</Typography>
                <IconButton
                  onClick={() => handleToggleFavorite(selectedOS.id)}
                  color={selectedOS.isFavorite ? 'error' : 'default'}
                >
                  {selectedOS.isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={selectedOS.images?.logo || '/api/placeholder/400/300'}
                    alt={selectedOS.name}
                    sx={{ objectFit: 'contain' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedOS.developer}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedOS.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Statistics:</Typography>
                    <Typography variant="body2">Average Rating: {selectedOS.stats?.averageRating?.toFixed(1)}/5</Typography>
                    <Typography variant="body2">Total Reviews: {selectedOS.stats?.totalReviews}</Typography>
                    <Typography variant="body2">Favorites: {selectedOS.stats?.favorites}</Typography>
                    <Typography variant="body2">Views: {selectedOS.stats?.views}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Categories:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedOS.categories?.map((category) => (
                        <Chip key={category} label={category} />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>System Requirements:</Typography>
                    <Typography variant="body2">Architecture: {selectedOS.architecture}</Typography>
                    <Typography variant="body2">License: {selectedOS.license}</Typography>
                    <Typography variant="body2">Release Date: {new Date(selectedOS.releaseDate).toLocaleDateString()}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedOS(null)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<Compare />}
                onClick={() => handleAddToComparison(selectedOS.id)}
              >
                Add to Comparison
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default OperatingSystemsList;
