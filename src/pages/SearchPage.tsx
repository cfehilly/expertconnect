import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { SearchResult, SearchResultExpert, SearchResultTopic, SearchResultHelpRequest } from '../types/db';
import { Users, MessageSquareText, FileText, Frown, Star, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categorizedResults, setCategorizedResults] = useState<{
    experts: SearchResultExpert[];
    topics: SearchResultTopic[];
    helpRequests: SearchResultHelpRequest[];
  }>({ experts: [], topics: [], helpRequests: [] });

  useEffect(() => {
    if (!searchQuery) {
      setLoading(false);
      setResults([]);
      setCategorizedResults({ experts: [], topics: [], helpRequests: [] });
      return;
    }

    async function performSearch() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: rpcError } = await supabase.rpc('search_global', {
          p_search_term: searchQuery
        });

        if (rpcError) {
          console.error('Error performing global search:', rpcError);
          setError(`Failed to perform search: ${rpcError.message}`);
          setResults([]);
          setCategorizedResults({ experts: [], topics: [], helpRequests: [] });
        } else {
          const fetchedResults: SearchResult[] = data || [];
          setResults(fetchedResults);

          const experts: SearchResultExpert[] = fetchedResults.filter((r) => r.type === 'expert') as SearchResultExpert[];
          const topics: SearchResultTopic[] = fetchedResults.filter((r) => r.type === 'topic') as SearchResultTopic[];
          const helpRequests: SearchResultHelpRequest[] = fetchedResults.filter((r) => r.type === 'help_request') as SearchResultHelpRequest[];

          setCategorizedResults({ experts, topics, helpRequests });
        }
      } catch (err: any) {
        console.error('Unexpected error during search:', err.message);
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [searchQuery]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'busy': return Clock;
      case 'offline': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const renderResultCard = (result: SearchResult) => {
    let title, description, linkPath, icon: React.ElementType, iconColorClass = '';
    let contentDisplay = null;

    switch (result.type) {
      case 'expert':
        const expert = result as SearchResultExpert;
        const StatusIconExpert = getStatusIcon(expert.status);
        title = expert.name || expert.email || 'Expert';
        description = expert.department || expert.role || expert.email || '';
        linkPath = `/experts/${expert.id}`;
        icon = Users;
        iconColorClass = 'text-blue-500';
        contentDisplay = (
          <>
            <div className="flex items-center justify-end space-x-1 mb-1 text-right">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">{expert.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-gray-500">({expert.completed_helps || 0} helps)</span>
            </div>
            <div className="flex items-center justify-end space-x-1 text-right">
              <Award className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 capitalize">{expert.role}</span>
            </div>
            <div className="flex items-center justify-end space-x-1 mt-1 text-xs">
              <StatusIconExpert className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-500 capitalize">{expert.status || 'N/A'}</span>
            </div>
            {expert.expertise && expert.expertise.length > 0 && (
                <div className="flex flex-wrap justify-end gap-1 mt-2">
                    {expert.expertise.slice(0, 2).map((skill, index) => (
                        <span key={index} className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{skill}</span>
                    ))}
                    {expert.expertise.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">+{expert.expertise.length - 2} more</span>
                    )}
                </div>
            )}
          </>
        );
        break;
      case 'topic':
        const topic = result as SearchResultTopic;
        title = topic.title;
        description = topic.description;
        linkPath = `/forum/topic/${topic.id}`;
        icon = MessageSquareText;
        iconColorClass = 'text-purple-500';
        contentDisplay = (
          <p className="text-xs text-gray-500 mt-2 text-right">Posted: {new Date(topic.created_at).toLocaleDateString()}</p>
        );
        break;
      case 'help_request':
        const request = result as SearchResultHelpRequest;
        title = request.title;
        description = request.description;
        linkPath = `/requests/${request.id}`;
        icon = FileText;
        iconColorClass = 'text-emerald-500';
        contentDisplay = (
          <p className="text-xs text-gray-500 mt-2 text-right">Status: <span className="capitalize font-medium">{request.status || 'N/A'}</span> | Posted: {new Date(request.created_at).toLocaleDateString()}</p>
        );
        break;
      default:
        return null;
    }

    const IconComponent = icon;

    return (
      <Link to={linkPath} key={`${result.type}-${result.id}`} className="block group">
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100 transform group-hover:-translate-y-1 relative">
          <div className="flex items-start mb-3">
            <div className={`p-2 rounded-lg mr-3 ${iconColorClass} bg-opacity-10`} style={{backgroundColor: iconColorClass.replace('text-', '').replace('500', '100').replace('400', '100')}}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 capitalize">{result.type.replace('_', ' ')}</p>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{title}</h3>
            </div>
          </div>
          {/* Expert's avatar for Expert results, positioned at top right */}
          {result.type === 'expert' && (result as SearchResultExpert).avatar && (
            <img
              src={(result as SearchResultExpert).avatar || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={(result as SearchResultExpert).name || 'Expert'}
              className="h-10 w-10 rounded-full object-cover border border-gray-200 absolute top-5 right-5"
            />
          )}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>

          {contentDisplay && <div className="border-t pt-3 mt-3">{contentDisplay}</div>}

          {/* --- REMOVED RELEVANCE SCORE --- */}
          {/* <p className="text-xs text-gray-500 mt-3 text-right">Relevance: {result.match_rank?.toFixed(2)}</p> */}
          {/* --- END REMOVED --- */}
        </div>
      </Link>
    );
  };

  const hasResults = categorizedResults.experts.length > 0 || categorizedResults.topics.length > 0 || categorizedResults.helpRequests.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">
        Search Results
      </h1>
      {searchQuery && <p className="text-xl font-semibold text-gray-700 mb-8 text-center">for "{searchQuery}"</p>}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Searching...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {!loading && !error && !searchQuery && (
        <div className="text-center py-10 bg-white rounded-xl shadow-md border border-gray-100">
          <Frown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Ready to search? Type your query in the bar above.</p>
        </div>
      )}

      {!loading && !error && searchQuery && !hasResults && (
        <div className="text-center py-10 bg-white rounded-xl shadow-md border border-gray-100">
          <Frown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No results found for "{searchQuery}". Try a different query!</p>
        </div>
      )}

      {!loading && hasResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10"> {/* 2 columns on large screens, increased gap */}
          {/* Experts Section */}
          {categorizedResults.experts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
                <Users className="h-7 w-7 mr-3 text-blue-600" /> Experts ({categorizedResults.experts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedResults.experts.map((expert) => renderResultCard(expert))}
              </div>
            </div>
          )}

          {/* Topics Section */}
          {categorizedResults.topics.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
                <MessageSquareText className="h-7 w-7 mr-3 text-purple-600" /> Topics ({categorizedResults.topics.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedResults.topics.map((topic) => renderResultCard(topic))}
              </div>
            </div>
          )}

          {/* Help Requests Section */}
          {categorizedResults.helpRequests.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center">
                <FileText className="h-7 w-7 mr-3 text-emerald-600" /> Help Requests ({categorizedResults.helpRequests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedResults.helpRequests.map((request) => renderResultCard(request))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}